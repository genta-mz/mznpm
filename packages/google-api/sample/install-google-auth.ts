import { GoogleAPI } from '../src';

// [usage]
// npx ts-node sample/install-google-auth.ts {key_file_json}

(async () => {
  const googleApi = new GoogleAPI('mznpm-sample');
  googleApi.installGoogleAuthKey({ filePath: process.argv[2] });
})();
