import { getColorByCode } from '../../src/color';

describe('ユーティリティ機能のテスト.', () => {
  it('カラーコードを値に変換する', () => {
    const c = getColorByCode('#808080');
    expect(c).toEqual({ red: 128, green: 128, blue: 128, alpha: 255 });
  });
  it('カラーコードを値に変換する(透過あり)', () => {
    const c = getColorByCode('#dc004880');
    expect(c).toEqual({ red: 220, green: 0, blue: 72, alpha: 128 });
  });
});
