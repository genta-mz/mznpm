import { GoogleAuthorizer } from './authorizer';
export declare class GoogleSpreadsheetAccessor {
    private readonly authorizer;
    constructor(authorizer: GoogleAuthorizer);
    getSheetValues(params: {
        spreadsheetId: string;
        range?: string;
        ranges?: string[];
    }): Promise<Map<string, string[][]>>;
}
