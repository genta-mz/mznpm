import { Auth } from 'googleapis';
interface IAuthClient {
    createClient(): Auth.OAuth2Client | Auth.GoogleAuth;
}
export declare class OAuth2ClientHandler {
    private readonly tokenDir;
    constructor(org: string, rootDir: string);
    createClient(): Auth.OAuth2Client;
    getToken(clientSecretPath: string, onAuthorize: (url: string) => void): void;
}
export type GoogleAuthKeyInfo = {
    filePath?: string;
    key?: string;
};
declare class GoogleAuthClientHandler {
    private readonly keyDir;
    constructor(org: string, rootDir: string);
    createClient(): Auth.GoogleAuth<import("google-auth-library/build/src/auth/googleauth").JSONClient>;
    installKey(param: GoogleAuthKeyInfo): void;
}
export declare enum GoogleAuthType {
    OAuth2 = 0,
    GoogleAuth = 1
}
export declare class GoogleAuthorizer implements IAuthClient {
    readonly oAuth2: OAuth2ClientHandler;
    readonly googleAuth: GoogleAuthClientHandler;
    private readonly type;
    constructor(type: GoogleAuthType, org: string, rootDir: string);
    createClient(): Auth.OAuth2Client | Auth.GoogleAuth<import("google-auth-library/build/src/auth/googleauth").JSONClient>;
}
export {};
