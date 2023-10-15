import { sheets_v4 } from 'googleapis';
import { GoogleAPIContext } from './internal/context';
export interface CellInfo {
    cell: sheets_v4.Schema$CellData;
    width: number;
    height: number;
    visible: boolean;
}
type CellValueType = string | number | boolean;
export declare class CellData {
    private readonly data;
    constructor(v?: CellValueType);
    setValue(v: CellValueType): this;
    setBackgroundColor(code: string): this;
    setFontColor(code: string): this;
    setFontBold(bold?: boolean): this;
    setFontItalic(italic?: boolean): this;
    setFormat(param: Partial<sheets_v4.Schema$CellFormat>): this;
    exporse(): sheets_v4.Schema$CellData;
}
export declare class GoogleSpreadsheetAccessor {
    private readonly context;
    private readonly spreadsheetContext;
    constructor(context: GoogleAPIContext);
    getSheetValues(params: {
        spreadsheetId: string;
        range?: string;
        ranges?: string[];
    }): Promise<Map<string, string[][]>>;
    getSheets(params: {
        spreadsheetId: string;
        ranges?: string[];
    }): Promise<Map<string, CellInfo[][]>>;
    updateValues(params: {
        spreadsheetId: string;
        requests: {
            sheetId?: number;
            range?: string;
            rows?: (CellData | string | boolean | number)[][];
            properties?: Partial<sheets_v4.Schema$SheetProperties>;
        }[];
    }): Promise<void>;
    setSheetProperties(params: {
        spreadsheetId: string;
        requests: {
            sheetName?: string;
            sheetId?: number;
            properties: Partial<sheets_v4.Schema$SheetProperties>;
        }[];
    }): Promise<void>;
    getSheetIdByName(params: {
        spreadsheetId: string;
        sheetName: string;
    }): Promise<number | undefined>;
}
export {};
