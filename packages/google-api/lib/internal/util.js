"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.code2Color = void 0;
const data_util_1 = require("@mznpm/data-util");
const code2Color = (code) => {
    if (!code) {
        return undefined;
    }
    const color = (0, data_util_1.getColorByCode)(code);
    return {
        red: color.red / 255,
        green: color.green / 255,
        blue: color.blue / 255,
        alpha: color.alpha / 255,
    };
};
exports.code2Color = code2Color;
