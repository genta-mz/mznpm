import { GoogleAuthorizer } from './authorizer';
export declare class GoogleSpreadsheetAccessor {
    private readonly authorizer;
    constructor(authorizer: GoogleAuthorizer);
    getValues(params: {
        spreadsheetId: string;
        range?: string;
        ranges?: string[];
    }): Promise<Map<string, string[][]>>;
}
