"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleAPI = void 0;
const authorizer_1 = require("./authorizer");
const drive_1 = require("./drive");
const api_runner_1 = require("./internal/api-runner");
const spreadsheet_1 = require("./spreadsheet");
class GoogleAPI {
    constructor(org, options) {
        this.authorizer = new authorizer_1.GoogleAuthorizer(org, (options === null || options === void 0 ? void 0 : options.rootDir) || `${process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME']}`);
        const context = {
            authorizer: this.authorizer,
            apiRunner: new api_runner_1.APIRunner(options === null || options === void 0 ? void 0 : options.errorConfig),
        };
        this.spreadsheet = new spreadsheet_1.GoogleSpreadsheetAccessor(context);
        this.drive = new drive_1.GoogleDriveAccessor(context);
    }
    installOAuth2Token(clientSecretPath, onAuthorize) {
        this.authorizer.saveToken(clientSecretPath, onAuthorize);
    }
}
exports.GoogleAPI = GoogleAPI;
