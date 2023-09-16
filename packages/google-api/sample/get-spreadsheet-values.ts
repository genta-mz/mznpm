import { GoogleAPI } from '../src';

// [usage]
// npx ts-node sample/get-spreadsheet-values.ts {spreadsheetId} {sheetName}

(async () => {
  const googleApi = new GoogleAPI('mznpm-sample');

  const spreadsheetId = process.argv[2];
  const sheetName = process.argv[3];

  const values = await googleApi.spreadsheet.getSheetValues({ spreadsheetId: spreadsheetId, range: sheetName });

  console.log(values);
})();
