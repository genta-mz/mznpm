import { sheets_v4 } from 'googleapis';
import { GoogleAuthorizer } from './authorizer';
export interface CellInfo {
    cell: sheets_v4.Schema$CellData;
    width: number;
    height: number;
    visible: boolean;
}
export declare class GoogleSpreadsheetAccessor {
    private readonly authorizer;
    constructor(authorizer: GoogleAuthorizer);
    getSheetValues(params: {
        spreadsheetId: string;
        range?: string;
        ranges?: string[];
    }): Promise<Map<string, string[][]>>;
    getSheets(params: {
        spreadsheetId: string;
        ranges?: string[];
    }): Promise<Map<string, CellInfo[][]>>;
}
