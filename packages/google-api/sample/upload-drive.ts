import { GoogleAPI } from '../src';

// [usage]
// npx ts-node sample/upload-drive.ts {path_to_upload_file}

(async () => {
  const googleApi = new GoogleAPI('mznpm-sample');
  const res = await googleApi.drive.upload({
    folderId: '1kPE-1tPPiU8LSSaL35gpb8_1AMU0O0pt',
    filePath: process.argv[2],
    mimeType: '	text/plain',
  });

  console.log(res);
})();
