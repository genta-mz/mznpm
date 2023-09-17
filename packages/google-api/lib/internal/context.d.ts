import { GoogleAuthorizer } from '../authorizer';
import { APIRunner } from './api-runner';
export interface GoogleAPIContext {
    authorizer: GoogleAuthorizer;
    apiRunner: APIRunner;
}
