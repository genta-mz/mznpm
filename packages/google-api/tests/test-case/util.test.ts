import { getAlphabetByColumn } from '../../src/util';

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
});
