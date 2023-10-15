import { GoogleAPI } from '../src';

// [usage]
// npx ts-node sample/get-sheet-id-by-name.ts {spreadsheetId} {sheetName}

const spreadsheetId = process.argv[2];

(async () => {
  {
    const googleApi = new GoogleAPI('mznpm-sample');
    const sheetId = await googleApi.spreadsheet.getSheetIdByName({
      spreadsheetId: spreadsheetId,
      sheetName: 'test-sheet',
    });
    console.log(sheetId);
  }
})();
