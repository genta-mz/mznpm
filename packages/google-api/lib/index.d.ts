import { GoogleAuthKeyInfo, GoogleAuthType } from './authorizer';
import { GoogleDriveAccessor } from './drive';
import { ErrorConfig } from './internal/api-runner';
import { GoogleSpreadsheetAccessor } from './spreadsheet';
export declare class GoogleAPI {
    readonly spreadsheet: GoogleSpreadsheetAccessor;
    readonly drive: GoogleDriveAccessor;
    private readonly authorizer;
    constructor(org: string, options?: {
        rootDir?: string;
        errorConfig?: ErrorConfig;
        authType?: GoogleAuthType;
    });
    installOAuth2Token(clientSecretPath: string, onAuthorize: (url: string) => void): void;
    installGoogleAuthKey(param: GoogleAuthKeyInfo): void;
}
