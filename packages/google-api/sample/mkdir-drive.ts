import { GoogleAPI } from '../src';

// [usage]
// npx ts-node sample/mkdir-drive.ts {path_of_folders}

(async () => {
  const googleApi = new GoogleAPI('mznpm-sample');
  const res = await googleApi.drive.mkdir({
    folderId: '1kPE-1tPPiU8LSSaL35gpb8_1AMU0O0pt',
    folderPath: process.argv[2],
  });

  console.log(res);
})();
