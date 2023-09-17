import { RangeInfo, getAlphabetByColumn, getColumnByAlphabet } from '../../src/util';

describe('ユーティリティ機能のテスト.', () => {
  it('スプレッドシートのカラム位置から対応するアルファベットを導く.', () => {
    const expectValues = new Map<number, string>([
      [0, 'A'],
      [23, 'X'],
      [37, 'AL'],
      [87, 'CJ'],
      [610, 'WM'],
      [735, 'ABH'],
    ]);

    expectValues.forEach((v, k) => {
      const char = getAlphabetByColumn(k);
      expect(char).toEqual(v);
    });
  });
  it('スプレッドシートのカラムアルファベットから対応する位置を導く.', () => {
    const expectValues = new Map<number, string>([
      [0, 'A'],
      [23, 'X'],
      [37, 'AL'],
      [87, 'CJ'],
      [610, 'WM'],
      [735, 'ABH'],
    ]);

    expectValues.forEach((v, k) => {
      const col = getColumnByAlphabet(v);
      expect(col).toEqual(k);
    });
  });
});

describe('range情報を構造化する', () => {
  it('rangeを指定する文字列を構造化する', () => {
    {
      const info = new RangeInfo('name!A1:C10');
      expect(info.startColumn).toEqual('A');
      expect(info.startRow).toEqual(0);
      expect(info.endColumn).toEqual('C');
      expect(info.endRow).toEqual(9);
    }
    {
      const info = new RangeInfo('name!C:ZZ');
      expect(info.startColumn).toEqual('C');
      expect(info.startRow).toEqual(0);
      expect(info.endColumn).toEqual('ZZ');
      expect(info.endRow).toEqual(999);
    }
    {
      const info = new RangeInfo('name!D1');
      expect(info.startColumn).toEqual('D');
      expect(info.startRow).toEqual(0);
      expect(info.endColumn).toEqual('D');
      expect(info.endRow).toEqual(0);
    }
  });
  it('rangeの近さを評価する', () => {
    const info = new RangeInfo('hoge!A1:A10');
    const sorted = ['hoge!Z1:AA10', 'fuga!A1:A5', 'hoge!A:A', 'hoge!C1:Z100', 'hoge', 'fuga'].sort((a, b) => {
      const aInfo = new RangeInfo(a);
      const bInfo = new RangeInfo(b);

      return aInfo.calcDistance(info) < bInfo.calcDistance(info) ? -1 : 1;
    });

    expect(sorted[0]).toEqual('hoge!A:A');
    expect(sorted[1]).toEqual('hoge');
    expect(sorted[2]).toEqual('hoge!C1:Z100');
    expect(sorted[3]).toEqual('hoge!Z1:AA10');
    expect(sorted[4]).toEqual('fuga!A1:A5');
    expect(sorted[5]).toEqual('fuga');
  });
});
