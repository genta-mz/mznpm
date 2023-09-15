export declare class GoogleAuthorizer {
    private readonly tokenDir;
    constructor(org: string, rootDir: string);
    authorize(): import("google-auth-library").OAuth2Client;
    saveToken(clientSecretPath: string): void;
}
