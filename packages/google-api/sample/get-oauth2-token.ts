import { GoogleAPI } from '../src';

// [usage]
// npx ts-node sample/get-oauth2-token.ts {path_to_client_secret_json}

(async () => {
  const googleApi = new GoogleAPI('mznpm-sample');
  googleApi.installOAuth2Token(process.argv[2]);
})();
