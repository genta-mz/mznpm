import { drive_v3 } from 'googleapis';
import { GoogleAPIContext } from './internal/context';
export declare enum DriveItemType {
    File = 0,
    Folder = 1
}
export declare class DriveItem {
    readonly type: DriveItemType;
    readonly mimetype?: string;
    readonly id?: string;
    readonly name?: string;
    readonly resourceKey?: string;
    constructor(file: drive_v3.Schema$File);
}
export declare class GoogleDriveAccessor {
    private readonly context;
    constructor(context: GoogleAPIContext);
    upload(param: {
        folderId?: string;
        filePath: string;
        mimeType: string;
    }): Promise<drive_v3.Schema$File>;
    mkdir(param: {
        folderId?: string;
        folderPath: string;
    }): Promise<{
        id: string;
        name: string;
    } | undefined>;
    list(param: {
        folderId?: string;
    }): Promise<DriveItem[]>;
}
