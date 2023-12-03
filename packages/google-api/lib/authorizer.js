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
exports.GoogleAuthorizer = exports.GoogleAuthType = exports.OAuth2ClientHandler = void 0;
const fs_extra_1 = require("fs-extra");
const googleapis_1 = require("googleapis");
const http_1 = require("http");
const path_1 = require("path");
const url_1 = require("url");
const TOKEN_DIR_NAME = '.mznode';
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'];
class OAuth2ClientHandler {
    constructor(org, rootDir) {
        this.tokenDir = (0, path_1.join)(rootDir, TOKEN_DIR_NAME, org);
    }
    createClient() {
        const clientSecret = (0, fs_extra_1.readJSONSync)((0, path_1.join)(this.tokenDir, 'client-secret.json'), { encoding: 'utf-8' });
        const tokens = (0, fs_extra_1.readJSONSync)((0, path_1.join)(this.tokenDir, 'tokens.json'), { encoding: 'utf-8' });
        const client = new googleapis_1.google.auth.OAuth2(`${clientSecret.client_id}`, `${clientSecret.client_secret}`, 'http://localhost:3000');
        client.credentials = tokens;
        return client;
    }
    getToken(clientSecretPath, onAuthorize) {
        const clientSecret = (0, fs_extra_1.readJSONSync)((0, path_1.resolve)(clientSecretPath));
        const client = new googleapis_1.google.auth.OAuth2(`${clientSecret.installed.client_id}`, `${clientSecret.installed.client_secret}`, 'http://localhost:3000');
        const authUrl = client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });
        onAuthorize(authUrl);
        const server = (0, http_1.createServer)((req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const qs = new url_1.URL(req.url || '', 'http://localhost:3000').searchParams;
                const code = qs.get('code');
                if (!code) {
                    throw new Error(`Invalid code. ${code}`);
                }
                (0, fs_extra_1.mkdirpSync)(this.tokenDir);
                const tokenResponse = yield client.getToken(code);
                {
                    const savePath = (0, path_1.join)(this.tokenDir, 'client-secret.json');
                    (0, fs_extra_1.writeJSONSync)(savePath, clientSecret.installed, { encoding: 'utf-8' });
                    console.log(savePath);
                }
                {
                    const savePath = (0, path_1.join)(this.tokenDir, 'tokens.json');
                    (0, fs_extra_1.writeJSONSync)(savePath, tokenResponse.tokens, { encoding: 'utf-8' });
                    console.log(savePath);
                }
                res.end('Success!');
            }
            catch (e) {
                res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(`${e}`);
            }
            server.close();
            process.exit(0);
        }));
        server.listen(3000);
    }
}
exports.OAuth2ClientHandler = OAuth2ClientHandler;
class GoogleAuthClientHandler {
    constructor(org, rootDir) {
        this.keyDir = (0, path_1.join)(rootDir, TOKEN_DIR_NAME, org);
    }
    createClient() {
        const client = new googleapis_1.Auth.GoogleAuth({
            keyFile: (0, path_1.join)(this.keyDir, 'service-account-key.json'),
            scopes: SCOPES,
        });
        return client;
    }
    installKey(param) {
        const buffer = param.key || (param.filePath && (0, fs_extra_1.readFileSync)((0, path_1.resolve)(param.filePath)));
        if (!buffer) {
            throw new Error(`Invalid Key: ${JSON.stringify(param)}`);
        }
        (0, fs_extra_1.writeFileSync)((0, path_1.join)(this.keyDir, 'service-account-key.json'), buffer, { encoding: 'utf-8' });
    }
}
var GoogleAuthType;
(function (GoogleAuthType) {
    GoogleAuthType[GoogleAuthType["OAuth2"] = 0] = "OAuth2";
    GoogleAuthType[GoogleAuthType["GoogleAuth"] = 1] = "GoogleAuth";
})(GoogleAuthType || (exports.GoogleAuthType = GoogleAuthType = {}));
class GoogleAuthorizer {
    constructor(type, org, rootDir) {
        this.type = type;
        this.oAuth2 = new OAuth2ClientHandler(org, rootDir);
        this.googleAuth = new GoogleAuthClientHandler(org, rootDir);
    }
    createClient() {
        switch (this.type) {
            case GoogleAuthType.OAuth2:
                return this.oAuth2.createClient();
            case GoogleAuthType.GoogleAuth:
                return this.googleAuth.createClient();
        }
        throw new Error(`Unhandled Auth Type ${this.type}`);
    }
}
exports.GoogleAuthorizer = GoogleAuthorizer;
