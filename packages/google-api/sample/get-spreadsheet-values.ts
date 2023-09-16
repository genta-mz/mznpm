import { GoogleAPI } from '../src';

// [usage]
// npx ts-node sample/get-spreadsheet-values.ts {spreadsheetId} {sheetName}

const spreadsheetId = process.argv[2];
const sheetName = process.argv[3];

(async () => {
  {
    const googleApi = new GoogleAPI('mznpm-sample');
    const values = await googleApi.spreadsheet.getSheetValues({ spreadsheetId: spreadsheetId, range: sheetName });
    console.log(values);
  }

  {
    const googleApi = new GoogleAPI('mznpm-sample');
    const spreadsheetId = process.argv[2];

    const values = await googleApi.spreadsheet.getSheets({
      spreadsheetId: spreadsheetId,
      ranges: ['index!A1:A10', 'index!B1:B10'],
    });

    console.log(values.get('index!A1:A10'));
  }
})();
