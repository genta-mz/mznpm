"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RangeInfo = exports.parseAddressStr = exports.getColumnByAlphabet = exports.getAlphabetByColumn = void 0;
const ALPHABET_COUNT = 26;
const getAlphabetByColumn = (column) => {
    let prefix = '';
    if (column >= 26) {
        prefix += (0, exports.getAlphabetByColumn)((column - 26 - (column % ALPHABET_COUNT)) / ALPHABET_COUNT);
    }
    return prefix + String.fromCharCode(0x41 + (column % ALPHABET_COUNT));
};
exports.getAlphabetByColumn = getAlphabetByColumn;
const getColumnByAlphabet = (str) => {
    let col = 0;
    for (let i = 0; i < str.length; ++i) {
        col += Math.pow(26, str.length - 1 - i) * (str.charCodeAt(i) - 0x40);
    }
    return col - 1;
};
exports.getColumnByAlphabet = getColumnByAlphabet;
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
            this.startRow = (info.row || 1) - 1;
        }
        {
            const info = (0, exports.parseAddressStr)(addressPair.length >= 2 ? addressPair[1] : `${this.startColumn}${this.startRow + 1}`);
            this.endColumn = info.column || 'Z';
            this.endRow = (info.row || 1000) - 1;
        }
    }
    calcDistance(other) {
        if (this.name !== other.name) {
            return Number.MAX_SAFE_INTEGER;
        }
        const f = (posA, posB) => {
            const dx = Math.abs(posB.x - posA.x);
            const dy = Math.abs(posB.y - posA.y);
            return Math.sqrt(dx * dx + dy * dy);
        };
        return (f({ x: (0, exports.getColumnByAlphabet)(this.endColumn), y: this.endRow }, { x: (0, exports.getColumnByAlphabet)(other.endColumn), y: other.endRow }) *
            f({ x: (0, exports.getColumnByAlphabet)(this.startColumn), y: this.startRow }, { x: (0, exports.getColumnByAlphabet)(other.startColumn), y: other.startRow }));
    }
}
exports.RangeInfo = RangeInfo;
