import { google, sheets_v4 } from 'googleapis';
import { GoogleAuthorizer } from './authorizer';
import { getAlphabetByColumn, RangeInfo } from './util';

export interface CellInfo {
  cell: sheets_v4.Schema$CellData;
  width: number;
  height: number;
  visible: boolean;
}

export class GoogleSpreadsheetAccessor {
  private readonly authorizer: GoogleAuthorizer;

  constructor(authorizer: GoogleAuthorizer) {
    this.authorizer = authorizer;
  }

  public async getSheetValues(params: { spreadsheetId: string; range?: string; ranges?: string[] }) {
    const ranges = params.ranges || [params.range || ''];

    const response = await google.sheets('v4').spreadsheets.values.batchGet({
      auth: this.authorizer.authorize(),
      spreadsheetId: params.spreadsheetId,
      ranges: ranges,
    });

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
    const response = await google.sheets('v4').spreadsheets.get({
      auth: this.authorizer.authorize(),
      spreadsheetId: params.spreadsheetId,
      ranges: params.ranges,
      includeGridData: true,
    });

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
}
