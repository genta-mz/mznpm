import { GoogleAPI } from '../src';
import { code2Color } from '../src/internal/util';
import { CellData } from '../src/spreadsheet';

// [usage]
// npx ts-node sample/update-spreadsheet.ts {spreadsheetId}

const spreadsheetId = process.argv[2];

(async () => {
  {
    const table = [
      ['aaa', 'bbb', 'ccc', 'comment'],
      [0, 1, 2],
      [3, 4, 5, 'This is comment.'],
      [6, 7, 'final'],
    ];
    const googleApi = new GoogleAPI('mznpm-sample');
    await googleApi.spreadsheet.updateValues({
      spreadsheetId: spreadsheetId,
      requests: [{ range: 'test-sheet-0', rows: table }],
    });
  }

  {
    const table = [
      ['ddd', 'eee', 'fff', 'comment'],
      [8, 9, 10],
      [11, 12, 13, 'This is comment.'],
      [14, 15, 'final'],
    ];
    const googleApi = new GoogleAPI('mznpm-sample');
    await googleApi.spreadsheet.updateValues({
      spreadsheetId: spreadsheetId,
      requests: [{ range: 'test-sheet-0!E5', rows: table }],
    });
  }

  {
    const table = [
      [
        new CellData('ggg').setBackgroundColor('#808080').setFontBold().setFontItalic().setFontColor('#ffffff'),
        new CellData('hhh').setBackgroundColor('#808080').setFontBold().setFontItalic().setFontColor('#ffffff'),
        new CellData('iii').setBackgroundColor('#808080').setFontBold().setFontItalic().setFontColor('#ffffff'),
        new CellData('comment').setBackgroundColor('#808080').setFontBold().setFontItalic().setFontColor('#ffffff'),
      ],
      [8, 9, 10],
      [11, 12, 13, 'This is comment.'],
      [14, 15, 'final'],
    ];
    const googleApi = new GoogleAPI('mznpm-sample');
    await googleApi.spreadsheet.updateValues({
      spreadsheetId: spreadsheetId,
      requests: [
        { range: 'test-sheet-0!A5', rows: table },
        { sheetId: 523470844, rows: table, properties: { title: new Date().toISOString(), index: 1 } },
      ],
    });
  }

  {
    const googleApi = new GoogleAPI('mznpm-sample');
    await googleApi.spreadsheet.setSheetProperties({
      spreadsheetId: spreadsheetId,
      requests: [
        {
          sheetId: 742597602,
          properties: {
            title: new Date().toString(),
            tabColor: code2Color('#ff0000'),
            index: 0,
          },
        },
      ],
    });
  }
})();
