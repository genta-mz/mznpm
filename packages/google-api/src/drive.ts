import { google } from 'googleapis';
import { GoogleAuthorizer } from './authorizer';
import { createReadStream } from 'fs';
import { basename, resolve } from 'path';

export class GoogleDriveAccessor {
  private readonly authorizer: GoogleAuthorizer;

  constructor(authorizer: GoogleAuthorizer) {
    this.authorizer = authorizer;
  }

  public async upload(param: { folderId?: string; filePath: string; mimeType: string }) {
    const response = await google.drive('v3').files.create({
      auth: this.authorizer.authorize(),
      requestBody: {
        parents: param.folderId ? [param.folderId] : undefined,
        name: basename(param.filePath),
      },
      media: { mimeType: param.mimeType, body: createReadStream(resolve(param.filePath)) },
    });

    return response.data;
  }
}
