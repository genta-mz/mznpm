import { GoogleAPI } from '../src';

// [usage]
// npx ts-node sample/upload-drive.ts {path_to_upload_file}

(async () => {
  const googleApi = new GoogleAPI('mznpm-sample');
  const res = await googleApi.drive.upload({
    folderId: process.argv[2],
    filePath: process.argv[3],
    mimeType: '	text/plain',
  });

  console.log(res);
})();
