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
const data_util_1 = require("@mznpm/data-util");
class GoogleSpreadsheetAccessor {
    constructor(context) {
        this.context = context;
    }
    getSheetValues(params) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const ranges = params.ranges || [params.range || ''];
            const response = yield this.context.apiRunner.withRetry(() => googleapis_1.google.sheets('v4').spreadsheets.values.batchGet({
                auth: this.context.authorizer.authorize(),
                spreadsheetId: params.spreadsheetId,
                ranges: ranges,
            }), (e) => {
                var _a;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if (((_a = e.response) === null || _a === void 0 ? void 0 : _a.status) === 404) {
                    return false;
                }
                return true;
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
    getSheets(params) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.context.apiRunner.withRetry(() => googleapis_1.google.sheets('v4').spreadsheets.get({
                auth: this.context.authorizer.authorize(),
                spreadsheetId: params.spreadsheetId,
                ranges: params.ranges,
                includeGridData: true,
            }), (e) => {
                var _a;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if (((_a = e.response) === null || _a === void 0 ? void 0 : _a.status) === 404) {
                    return false;
                }
                return true;
            });
            const requestRangeInfos = ((_a = params.ranges) === null || _a === void 0 ? void 0 : _a.map((item) => new data_util_1.RangeInfo(item))) || [];
            const result = new Map();
            (_b = response.data.sheets) === null || _b === void 0 ? void 0 : _b.forEach((sheet) => {
                var _a, _b;
                const sheetName = ((_a = sheet.properties) === null || _a === void 0 ? void 0 : _a.title) || '';
                (_b = sheet.data) === null || _b === void 0 ? void 0 : _b.forEach((grid) => {
                    var _a, _b;
                    const startColumn = (0, data_util_1.getAlphabetByColumn)(grid.startColumn || 0);
                    const startRow = grid.startRow || 0;
                    const maxLength = ((_a = grid.rowData) === null || _a === void 0 ? void 0 : _a.map((row) => { var _a; return ((_a = row.values) === null || _a === void 0 ? void 0 : _a.length) || 0; }).sort((a, b) => (a > b ? -1 : 1)).shift()) || 0;
                    const endColumn = (0, data_util_1.getAlphabetByColumn)((grid.startColumn || 0) + (maxLength - 1));
                    const endRow = ((_b = grid.rowData) === null || _b === void 0 ? void 0 : _b.length) || 0;
                    const rangeInfo = new data_util_1.RangeInfo(`${sheetName}!${startColumn}${startRow + 1}:${endColumn}${endRow + 1}`);
                    const requestedInfo = requestRangeInfos
                        .sort((a, b) => (a.calcDistance(rangeInfo) < b.calcDistance(rangeInfo) ? -1 : 1))
                        .shift();
                    const key = requestedInfo ? requestedInfo.range : sheetName;
                    const columnMetadatas = grid.columnMetadata || [];
                    const rowMetadatas = grid.rowMetadata || [];
                    const data = (grid.rowData || []).map((row, rowIndex) => {
                        const rowMetadata = rowMetadatas.length ? rowMetadatas[rowIndex] : {};
                        return (row.values || []).map((value, valueIndex) => {
                            const colMetadata = columnMetadatas.length ? columnMetadatas[valueIndex] : {};
                            return {
                                cell: value,
                                width: colMetadata.pixelSize || 100,
                                height: rowMetadata.pixelSize || 20,
                                visible: !(colMetadata.hiddenByFilter ||
                                    colMetadata.hiddenByUser ||
                                    rowMetadata.hiddenByFilter ||
                                    rowMetadata.hiddenByUser),
                            };
                        }); // (row.values || []).map
                    }); // (grid.rowData || []).map
                    result.set(key, data);
                }); // sheet.data?.forEach
            }); // response.data.sheets?.forEach
            return result;
        });
    }
}
exports.GoogleSpreadsheetAccessor = GoogleSpreadsheetAccessor;
