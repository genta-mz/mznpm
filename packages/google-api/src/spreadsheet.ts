import { google, sheets_v4 } from 'googleapis';
import { getAlphabetByColumn, getColumnByAlphabet, RangeInfo } from '@mznpm/data-util';
import { GoogleAPIContext } from './internal/context';
import { code2Color } from './internal/util';

export interface CellInfo {
  cell: sheets_v4.Schema$CellData;
  width: number;
  height: number;
  visible: boolean;
}

type CellValueType = string | number | boolean;

export class CellData {
  private readonly data: sheets_v4.Schema$CellData;

  constructor(v?: CellValueType) {
    this.data = {};
    this.setValue(v || '');
  }

  public setValue(v: CellValueType) {
    if (typeof v === 'string') {
      this.data.userEnteredValue = { stringValue: `${v}` };
    } else if (typeof v == 'number') {
      this.data.userEnteredValue = { numberValue: Number(v) };
    } else if (typeof v === 'boolean') {
      this.data.userEnteredValue = { boolValue: !!v };
    }

    return this;
  }

  public setBackgroundColor(code: string) {
    return this.setFormat({
      backgroundColor: code2Color(code),
    });
  }

  public setFontColor(code: string) {
    return this.setFormat({
      textFormat: {
        ...(this.data.userEnteredFormat?.textFormat || {}),
        ...{
          foregroundColor: code2Color(code),
        },
      },
    });
  }

  public setFontBold(bold: boolean = true) {
    return this.setFormat({
      textFormat: {
        ...(this.data.userEnteredFormat?.textFormat || {}),
        ...{
          bold: bold,
        },
      },
    });
  }

  public setFontItalic(italic: boolean = true) {
    return this.setFormat({
      textFormat: {
        ...(this.data.userEnteredFormat?.textFormat || {}),
        ...{
          italic: italic,
        },
      },
    });
  }

  public setFormat(param: Partial<sheets_v4.Schema$CellFormat>) {
    this.data.userEnteredFormat = { ...(this.data.userEnteredFormat || {}), ...param };

    return this;
  }

  public exporse(): sheets_v4.Schema$CellData {
    return this.data;
  }
}

export class GoogleSpreadsheetAccessor {
  private readonly context: GoogleAPIContext;
  private readonly spreadsheetContext: {
    sheetIdMap: Map<string, Map<string, number>>;
  };

  constructor(context: GoogleAPIContext) {
    this.context = context;
    this.spreadsheetContext = {
      sheetIdMap: new Map<string, Map<string, number>>(),
    };
  }

  public async getSheetValues(params: { spreadsheetId: string; range?: string; ranges?: string[] }) {
    const ranges = params.ranges || [params.range || ''];

    const response = await this.context.apiRunner.withRetry(
      () =>
        google.sheets('v4').spreadsheets.values.batchGet({
          auth: this.context.authorizer.authorize(),
          spreadsheetId: params.spreadsheetId,
          ranges: ranges,
        }),
      (e) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((e as any).response?.status === 404) {
          return false;
        }

        return true;
      }
    );

    const result = new Map<string, string[][]>();
    response.data.valueRanges?.forEach((item) => {
      const key =
        ranges.find((r) => r === item.range) || ranges.find((r) => item.range?.startsWith(`${r.replace(/!.*$/, '')}!`));
      if (!key) {
        return;
      }

      result.set(key, item.values || []);
    });

    return result;
  }

  public async getSheets(params: { spreadsheetId: string; ranges?: string[] }) {
    const response = await this.context.apiRunner.withRetry(
      () =>
        google.sheets('v4').spreadsheets.get({
          auth: this.context.authorizer.authorize(),
          spreadsheetId: params.spreadsheetId,
          ranges: params.ranges,
          includeGridData: true,
        }),
      (e) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((e as any).response?.status === 404) {
          return false;
        }

        return true;
      }
    );

    const requestRangeInfos = params.ranges?.map((item) => new RangeInfo(item)) || [];
    const result = new Map<string, CellInfo[][]>();

    response.data.sheets?.forEach((sheet) => {
      const sheetName = sheet.properties?.title || '';

      sheet.data?.forEach((grid) => {
        const startColumn = getAlphabetByColumn(grid.startColumn || 0);
        const startRow = grid.startRow || 0;

        const maxLength =
          grid.rowData
            ?.map((row) => row.values?.length || 0)
            .sort((a, b) => (a > b ? -1 : 1))
            .shift() || 0;

        const endColumn = getAlphabetByColumn((grid.startColumn || 0) + (maxLength - 1));
        const endRow = grid.rowData?.length || 0;

        const rangeInfo = new RangeInfo(`${sheetName}!${startColumn}${startRow + 1}:${endColumn}${endRow + 1}`);
        const requestedInfo = requestRangeInfos
          .sort((a, b) => (a.calcDistance(rangeInfo) < b.calcDistance(rangeInfo) ? -1 : 1))
          .shift();

        const key = requestedInfo ? requestedInfo.range : sheetName;
        const columnMetadatas = grid.columnMetadata || [];
        const rowMetadatas = grid.rowMetadata || [];

        const data: CellInfo[][] = (grid.rowData || []).map((row, rowIndex) => {
          const rowMetadata = rowMetadatas.length ? rowMetadatas[rowIndex] : {};

          return (row.values || []).map((value, valueIndex): CellInfo => {
            const colMetadata = columnMetadatas.length ? columnMetadatas[valueIndex] : {};

            return {
              cell: value,
              width: colMetadata.pixelSize || 100,
              height: rowMetadata.pixelSize || 20,
              visible: !(
                colMetadata.hiddenByFilter ||
                colMetadata.hiddenByUser ||
                rowMetadata.hiddenByFilter ||
                rowMetadata.hiddenByUser
              ),
            };
          }); // (row.values || []).map
        }); // (grid.rowData || []).map

        result.set(key, data);
      }); // sheet.data?.forEach
    }); // response.data.sheets?.forEach

    return result;
  }

  public async updateValues(params: {
    spreadsheetId: string;
    requests: {
      sheetId?: number;
      range?: string;
      rows?: (CellData | string | boolean | number)[][];
      properties?: Partial<sheets_v4.Schema$SheetProperties>;
    }[];
  }) {
    const requests: sheets_v4.Schema$Request[] = [];
    await Promise.all(
      params.requests.map(async (item) => {
        const rangeInfo = new RangeInfo(item.range || '');
        const sheetId = item.sheetId
          ? item.sheetId
          : await this.getSheetIdByName({ spreadsheetId: params.spreadsheetId, sheetName: rangeInfo.name });

        if (item.properties) {
          requests.push({
            updateSheetProperties: {
              fields: Object.keys(item.properties)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .filter((k) => (item.properties as any)[k] !== undefined)
                .join(','),
              properties: {
                ...{
                  sheetId: sheetId,
                },
                ...item.properties,
              },
            },
          });
        }
        if (item.rows) {
          const maxCol =
            item.rows
              ?.map((row) => row.length)
              .sort((a, b) => (a > b ? -1 : 1))
              .shift() || 1;

          const startCol = getColumnByAlphabet(rangeInfo.startColumn);
          const startRow = rangeInfo.startRow;
          const endCol = startCol + maxCol;
          const endRow = startRow + (item.rows?.length || 1);

          requests.push({
            updateCells: (() => {
              if (!item.rows) {
                return undefined;
              }
              return {
                fields: '*',
                range: {
                  sheetId: sheetId,
                  startColumnIndex: startCol,
                  startRowIndex: startRow,
                  endColumnIndex: endCol,
                  endRowIndex: endRow,
                },
                rows: item.rows.map((row) => ({
                  values: row.map((value): sheets_v4.Schema$CellData => {
                    if (value instanceof CellData) {
                      return value.exporse();
                    }

                    return new CellData(value).exporse();
                  }),
                })),
              };
            })(),
          });
        }
      })
    );

    await this.context.apiRunner.withRetry(
      () =>
        google.sheets('v4').spreadsheets.batchUpdate({
          auth: this.context.authorizer.authorize(),
          spreadsheetId: params.spreadsheetId,
          requestBody: { requests: requests },
        }),
      (e) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((e as any).response?.status === 404) {
          return false;
        }

        return true;
      }
    );
  }

  public async setSheetProperties(params: {
    spreadsheetId: string;
    requests: { sheetName?: string; sheetId?: number; properties: Partial<sheets_v4.Schema$SheetProperties> }[];
  }) {
    const updateRequests = await Promise.all(
      params.requests.map(async (item) => {
        const sheetId = item.sheetId
          ? item.sheetId
          : await this.getSheetIdByName({ spreadsheetId: params.spreadsheetId, sheetName: item.sheetName || '' });

        return {
          sheetId: sheetId,
          properties: item.properties,
        };
      })
    );

    return this.updateValues({
      spreadsheetId: params.spreadsheetId,
      requests: updateRequests,
    });
  }

  public async getSheetIdByName(params: { spreadsheetId: string; sheetName: string }) {
    if (!this.spreadsheetContext.sheetIdMap.has(params.spreadsheetId)) {
      const response = await this.context.apiRunner.withRetry(
        () =>
          google.sheets('v4').spreadsheets.get({
            auth: this.context.authorizer.authorize(),
            spreadsheetId: params.spreadsheetId,
            includeGridData: false,
          }),
        (e) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((e as any).response?.status === 404) {
            return false;
          }

          return true;
        }
      );

      const entries = response.data.sheets
        ?.map((item): [string | null | undefined, number | null | undefined] => [
          item.properties?.title,
          item.properties?.sheetId,
        ])
        .filter((pair) => pair[0] !== undefined && pair[0] !== null && pair[1] !== undefined && pair[1] !== null)
        .map((pair): [string, number] => [`${pair[0]}`, pair[1] || 0]);

      this.spreadsheetContext.sheetIdMap.set(params.spreadsheetId, new Map<string, number>(entries || []));
    }

    const map = this.spreadsheetContext.sheetIdMap.get(params.spreadsheetId);
    if (!map) {
      throw new Error(`getSheetIdByName: spreadsheetId not found. ${params.spreadsheetId}`);
    }

    const sheetId = map.get(params.sheetName);
    if (!map) {
      throw new Error(`getSheetIdByName: sheetName not found. ${params.sheetName} @ ${params.spreadsheetId}`);
    }

    return sheetId;
  }
}
