import { google, drive_v3 } from 'googleapis';
import { createReadStream } from 'fs';
import { basename, resolve, sep } from 'path';
import { GoogleAPIContext } from './internal/context';

export enum DriveItemType {
  File,
  Folder,
}

export class DriveItem {
  public readonly type: DriveItemType;
  public readonly mimetype?: string;
  public readonly id?: string;
  public readonly name?: string;
  public readonly resourceKey?: string;

  constructor(file: drive_v3.Schema$File) {
    this.type = (() => {
      if (file.mimeType == 'application/vnd.google-apps.folder') {
        return DriveItemType.Folder;
      }

      return DriveItemType.File;
    })();

    this.mimetype = file.mimeType || undefined;
    this.id = file.id || undefined;
    this.name = file.name || undefined;
    this.resourceKey = file.resourceKey || undefined;
  }
}

export class GoogleDriveAccessor {
  private readonly context: GoogleAPIContext;

  constructor(context: GoogleAPIContext) {
    this.context = context;
  }

  public async upload(param: { folderId?: string; filePath: string; mimeType: string }) {
    const response = await this.context.apiRunner.withRetry(() =>
      google.drive('v3').files.create({
        auth: this.context.authorizer.createClient(),
        requestBody: {
          parents: param.folderId ? [param.folderId] : undefined,
          name: basename(param.filePath),
        },
        media: { mimeType: param.mimeType, body: createReadStream(resolve(param.filePath)) },
      })
    );

    return response.data;
  }

  public async mkdir(param: { folderId?: string; folderPath: string }) {
    const dirs = param.folderPath.split(sep);

    let rootInfo: { id: string; name: string } | undefined = undefined;
    let folderId = param.folderId;
    for (const d of dirs) {
      const response = await this.context.apiRunner.withRetry(() =>
        google.drive('v3').files.create({
          auth: this.context.authorizer.createClient(),
          requestBody: {
            parents: folderId ? [folderId] : undefined,
            name: d,
            mimeType: 'application/vnd.google-apps.folder',
          },
        })
      );

      folderId = response.data.id || undefined;
      if (!rootInfo) {
        rootInfo = { id: folderId || '', name: d };
      }
    }

    return rootInfo;
  }

  public async list(param: { folderId?: string }) {
    const response = await this.context.apiRunner.withRetry(() =>
      google
        .drive('v3')
        .files.list({ auth: this.context.authorizer.createClient(), q: `'${param.folderId}' in parents` })
    );

    return (response.data.files || []).map((f) => new DriveItem(f));
  }
}
