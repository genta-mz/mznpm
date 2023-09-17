import { google } from 'googleapis';
import { GoogleAuthorizer } from './authorizer';
import { createReadStream } from 'fs';
import { basename, resolve, sep } from 'path';

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

  public async mkdir(param: { folderId?: string; folderPath: string }) {
    const dirs = param.folderPath.split(sep);

    let rootInfo: { id: string; name: string } | undefined = undefined;
    let folderId = param.folderId;
    for (const d of dirs) {
      const response = await google.drive('v3').files.create({
        auth: this.authorizer.authorize(),
        requestBody: {
          parents: folderId ? [folderId] : undefined,
          name: d,
          mimeType: 'application/vnd.google-apps.folder',
        },
      });

      folderId = response.data.id || undefined;
      if (!rootInfo) {
        rootInfo = { id: folderId || '', name: d };
      }
    }

    return rootInfo;
  }
}
