const ALPHABET_COUNT = 26;

export const getAlphabetByColumn = (column: number) => {
  let prefix = '';
  if (column >= 26) {
    prefix += getAlphabetByColumn((column - 26 - (column % ALPHABET_COUNT)) / ALPHABET_COUNT);
  }

  return prefix + String.fromCharCode(0x41 + (column % ALPHABET_COUNT));
};

export const parseAddressStr = (str: string) => {
  if (!/^[A-Z]+[0-9]*$/.test(str)) {
    return {};
  }

  const n = str.match(/[0-9]*$/)?.join('');
  return {
    column: str.match(/^[A-Z]+/)?.join(''),
    row: n && Number(n),
  };
};

export class RangeInfo {
  public readonly range: string;
  public readonly name: string;
  public readonly startColumn: string;
  public readonly startRow: number;
  public readonly endColumn: string;
  public readonly endRow: number;

  constructor(range: string) {
    this.range = range;

    const pair = range.split('!');

    this.name = pair.length >= 1 ? pair[0] : '';
    const address = pair.length >= 2 ? pair[1] : 'A1:Z1000';

    const addressPair = address.split(':');
    {
      const info = parseAddressStr(addressPair.length >= 1 ? addressPair[0] : '');
      this.startColumn = info.column || 'A';
      this.startRow = info.row || 0;
    }
    {
      const info = parseAddressStr(addressPair.length >= 2 ? addressPair[1] : '');
      this.endColumn = info.column || 'Z';
      this.endRow = info.row || 1000;
    }
  }

  public calcDistance(other: RangeInfo) {
    let d = 0;

    if (this.name !== other.name) {
      d += 10000;
    }
    if (this.startColumn != other.startColumn) {
      d += 1000;
    }
    if (this.endColumn != other.endColumn) {
      d += 100;
    }
    if (this.startRow != other.startRow) {
      d += 10;
    }
    if (this.endRow != other.endRow) {
      d += 1;
    }

    return d;
  }
}
