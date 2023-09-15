import { GoogleAuthorizer } from './authorizer';
import { GoogleSpreadsheetAccessor } from './spreadsheet';

export class GoogleAPI {
  public readonly spreadsheet: GoogleSpreadsheetAccessor;
  private readonly authorizer: GoogleAuthorizer;

  constructor(org: string, rootDir?: string) {
    this.authorizer = new GoogleAuthorizer(
      org,
      rootDir || `${process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME']}`
    );

    this.spreadsheet = new GoogleSpreadsheetAccessor(this.authorizer);
  }

  public installOAuth2Token(clientSecretPath: string) {
    this.authorizer.saveToken(clientSecretPath);
  }
}
