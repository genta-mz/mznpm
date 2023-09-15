import { GoogleSpreadsheetAccessor } from './spreadsheet';
export declare class GoogleAPI {
    readonly spreadsheet: GoogleSpreadsheetAccessor;
    private readonly authorizer;
    constructor(org: string, rootDir?: string);
    installOAuth2Token(clientSecretPath: string): void;
}
