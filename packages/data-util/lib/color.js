"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getColorByCode = void 0;
const getColorByCode = (code) => {
    if (!/#[0-9a-fA-F]{6,}?/.test(code)) {
        return { red: 255, green: 255, blue: 255, alpha: 255 };
    }
    const r = Number(`0x${code.substring(1, 3)}`);
    const g = Number(`0x${code.substring(3, 5)}`);
    const b = Number(`0x${code.substring(5, 7)}`);
    const a = code.length == 9 ? Number(`0x${code.substring(7, 9)}`) : 0xff;
    return { red: r, green: g, blue: b, alpha: a };
};
exports.getColorByCode = getColorByCode;
