import { GoogleAuthorizer } from './authorizer';
export declare class GoogleDriveAccessor {
    private readonly authorizer;
    constructor(authorizer: GoogleAuthorizer);
    upload(param: {
        folderId?: string;
        filePath: string;
        mimeType: string;
    }): Promise<import("googleapis").drive_v3.Schema$File>;
    mkdir(param: {
        folderId?: string;
        folderPath: string;
    }): Promise<{
        id: string;
        name: string;
    } | undefined>;
}
