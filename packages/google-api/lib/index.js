"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleAPI = void 0;
const authorizer_1 = require("./authorizer");
const spreadsheet_1 = require("./spreadsheet");
class GoogleAPI {
    constructor(org, rootDir) {
        this.authorizer = new authorizer_1.GoogleAuthorizer(org, rootDir || `${process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME']}`);
        this.spreadsheet = new spreadsheet_1.GoogleSpreadsheetAccessor(this.authorizer);
    }
    installOAuth2Token(clientSecretPath) {
        this.authorizer.saveToken(clientSecretPath);
    }
}
exports.GoogleAPI = GoogleAPI;
