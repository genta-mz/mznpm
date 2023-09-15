import { google } from 'googleapis';
import { GoogleAuthorizer } from './authorizer';

export class GoogleSpreadsheetAccessor {
  private readonly authorizer: GoogleAuthorizer;

  constructor(authorizer: GoogleAuthorizer) {
    this.authorizer = authorizer;
  }

  public async getValues(params: { spreadsheetId: string; range?: string; ranges?: string[] }) {
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
}
