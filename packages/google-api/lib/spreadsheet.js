"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleSpreadsheetAccessor = void 0;
const googleapis_1 = require("googleapis");
class GoogleSpreadsheetAccessor {
    constructor(authorizer) {
        this.authorizer = authorizer;
    }
    getSheetValues(params) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const ranges = params.ranges || [params.range || ''];
            const response = yield googleapis_1.google.sheets('v4').spreadsheets.values.batchGet({
                auth: this.authorizer.authorize(),
                spreadsheetId: params.spreadsheetId,
                ranges: ranges,
            });
            const result = new Map();
            (_a = response.data.valueRanges) === null || _a === void 0 ? void 0 : _a.forEach((item) => {
                const key = ranges.find((r) => r === item.range) || ranges.find((r) => { var _a; return (_a = item.range) === null || _a === void 0 ? void 0 : _a.startsWith(`${r.replace(/!.*$/, '')}!`); });
                if (!key) {
                    return;
                }
                result.set(key, item.values || []);
            });
            return result;
        });
    }
}
exports.GoogleSpreadsheetAccessor = GoogleSpreadsheetAccessor;
