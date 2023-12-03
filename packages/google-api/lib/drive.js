"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleDriveAccessor = exports.DriveItem = exports.DriveItemType = void 0;
const googleapis_1 = require("googleapis");
const fs_1 = require("fs");
const path_1 = require("path");
var DriveItemType;
(function (DriveItemType) {
    DriveItemType[DriveItemType["File"] = 0] = "File";
    DriveItemType[DriveItemType["Folder"] = 1] = "Folder";
})(DriveItemType || (exports.DriveItemType = DriveItemType = {}));
class DriveItem {
    constructor(file) {
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
exports.DriveItem = DriveItem;
class GoogleDriveAccessor {
    constructor(context) {
        this.context = context;
    }
    upload(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.context.apiRunner.withRetry(() => googleapis_1.google.drive('v3').files.create({
                auth: this.context.authorizer.createClient(),
                requestBody: {
                    parents: param.folderId ? [param.folderId] : undefined,
                    name: (0, path_1.basename)(param.filePath),
                },
                media: { mimeType: param.mimeType, body: (0, fs_1.createReadStream)((0, path_1.resolve)(param.filePath)) },
            }));
            return response.data;
        });
    }
    mkdir(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const dirs = param.folderPath.split(path_1.sep);
            let rootInfo = undefined;
            let folderId = param.folderId;
            for (const d of dirs) {
                const response = yield this.context.apiRunner.withRetry(() => googleapis_1.google.drive('v3').files.create({
                    auth: this.context.authorizer.createClient(),
                    requestBody: {
                        parents: folderId ? [folderId] : undefined,
                        name: d,
                        mimeType: 'application/vnd.google-apps.folder',
                    },
                }));
                folderId = response.data.id || undefined;
                if (!rootInfo) {
                    rootInfo = { id: folderId || '', name: d };
                }
            }
            return rootInfo;
        });
    }
    list(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.context.apiRunner.withRetry(() => googleapis_1.google
                .drive('v3')
                .files.list({ auth: this.context.authorizer.createClient(), q: `'${param.folderId}' in parents` }));
            return (response.data.files || []).map((f) => new DriveItem(f));
        });
    }
}
exports.GoogleDriveAccessor = GoogleDriveAccessor;
