import { GoogleAuthorizer } from './authorizer';
import { GoogleDriveAccessor } from './drive';
import { GoogleSpreadsheetAccessor } from './spreadsheet';

export class GoogleAPI {
  public readonly spreadsheet: GoogleSpreadsheetAccessor;
  public readonly drive: GoogleDriveAccessor;
  private readonly authorizer: GoogleAuthorizer;

  constructor(org: string, rootDir?: string) {
    this.authorizer = new GoogleAuthorizer(
      org,
      rootDir || `${process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME']}`
    );

    this.spreadsheet = new GoogleSpreadsheetAccessor(this.authorizer);
    this.drive = new GoogleDriveAccessor(this.authorizer);
  }

  public installOAuth2Token(clientSecretPath: string) {
    this.authorizer.saveToken(clientSecretPath);
  }
}
