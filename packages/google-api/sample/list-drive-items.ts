import { GoogleAPI } from '../src';

// [usage]
// npx ts-node sample/list-drive-items.ts {folder_id}

(async () => {
  const googleApi = new GoogleAPI('mznpm-sample');
  const res = await googleApi.drive.list({
    folderId: process.argv[2],
  });

  console.log(res);
})();
