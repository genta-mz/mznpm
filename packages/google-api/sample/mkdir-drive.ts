import { GoogleAPI } from '../src';

// [usage]
// npx ts-node sample/mkdir-drive.ts {parent_folder_id} {path_of_folders}

(async () => {
  const googleApi = new GoogleAPI('mznpm-sample');
  const res = await googleApi.drive.mkdir({
    folderId: process.argv[2],
    folderPath: process.argv[3],
  });

  console.log(res);
})();
