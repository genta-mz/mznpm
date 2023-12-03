import { GoogleAuthType, GoogleAuthorizer } from './authorizer';
import { GoogleDriveAccessor } from './drive';
import { APIRunner, ErrorConfig } from './internal/api-runner';
import { GoogleAPIContext } from './internal/context';
import { GoogleSpreadsheetAccessor } from './spreadsheet';

export class GoogleAPI {
  public readonly spreadsheet: GoogleSpreadsheetAccessor;
  public readonly drive: GoogleDriveAccessor;

  private readonly authorizer: GoogleAuthorizer;

  constructor(org: string, options?: { rootDir?: string; errorConfig?: ErrorConfig; authType?: GoogleAuthType }) {
    this.authorizer = new GoogleAuthorizer(
      options?.authType || GoogleAuthType.OAuth2,
      org,
      options?.rootDir || `${process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME']}`
    );

    const context: GoogleAPIContext = {
      authorizer: this.authorizer,
      apiRunner: new APIRunner(options?.errorConfig),
    };

    this.spreadsheet = new GoogleSpreadsheetAccessor(context);
    this.drive = new GoogleDriveAccessor(context);
  }

  public installOAuth2Token(clientSecretPath: string, onAuthorize: (url: string) => void) {
    this.authorizer.oAuth2.getToken(clientSecretPath, onAuthorize);
  }
}
