"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RangeInfo = exports.parseAddressStr = exports.getAlphabetByColumn = void 0;
const ALPHABET_COUNT = 26;
const getAlphabetByColumn = (column) => {
    let prefix = '';
    if (column >= 26) {
        prefix += (0, exports.getAlphabetByColumn)((column - 26 - (column % ALPHABET_COUNT)) / ALPHABET_COUNT);
    }
    return prefix + String.fromCharCode(0x41 + (column % ALPHABET_COUNT));
};
exports.getAlphabetByColumn = getAlphabetByColumn;
const parseAddressStr = (str) => {
    var _a, _b;
    if (!/^[A-Z]+[0-9]*$/.test(str)) {
        return {};
    }
    const n = (_a = str.match(/[0-9]*$/)) === null || _a === void 0 ? void 0 : _a.join('');
    return {
        column: (_b = str.match(/^[A-Z]+/)) === null || _b === void 0 ? void 0 : _b.join(''),
        row: n && Number(n),
    };
};
exports.parseAddressStr = parseAddressStr;
class RangeInfo {
    constructor(range) {
        this.range = range;
        const pair = range.split('!');
        this.name = pair.length >= 1 ? pair[0] : '';
        const address = pair.length >= 2 ? pair[1] : 'A1:Z1000';
        const addressPair = address.split(':');
        {
            const info = (0, exports.parseAddressStr)(addressPair.length >= 1 ? addressPair[0] : '');
            this.startColumn = info.column || 'A';
            this.startRow = info.row || 0;
        }
        {
            const info = (0, exports.parseAddressStr)(addressPair.length >= 2 ? addressPair[1] : '');
            this.endColumn = info.column || 'Z';
            this.endRow = info.row || 1000;
        }
    }
    calcDistance(other) {
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
exports.RangeInfo = RangeInfo;
