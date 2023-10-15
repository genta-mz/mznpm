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
exports.GoogleSpreadsheetAccessor = exports.CellData = void 0;
const googleapis_1 = require("googleapis");
const data_util_1 = require("@mznpm/data-util");
const util_1 = require("./internal/util");
class CellData {
    constructor(v) {
        this.data = {};
        this.setValue(v || '');
    }
    setValue(v) {
        if (typeof v === 'string') {
            this.data.userEnteredValue = { stringValue: `${v}` };
        }
        else if (typeof v == 'number') {
            this.data.userEnteredValue = { numberValue: Number(v) };
        }
        else if (typeof v === 'boolean') {
            this.data.userEnteredValue = { boolValue: !!v };
        }
        return this;
    }
    setBackgroundColor(code) {
        return this.setFormat({
            backgroundColor: (0, util_1.code2Color)(code),
        });
    }
    setFontColor(code) {
        var _a;
        return this.setFormat({
            textFormat: Object.assign(Object.assign({}, (((_a = this.data.userEnteredFormat) === null || _a === void 0 ? void 0 : _a.textFormat) || {})), {
                foregroundColor: (0, util_1.code2Color)(code),
            }),
        });
    }
    setFontBold(bold = true) {
        var _a;
        return this.setFormat({
            textFormat: Object.assign(Object.assign({}, (((_a = this.data.userEnteredFormat) === null || _a === void 0 ? void 0 : _a.textFormat) || {})), {
                bold: bold,
            }),
        });
    }
    setFontItalic(italic = true) {
        var _a;
        return this.setFormat({
            textFormat: Object.assign(Object.assign({}, (((_a = this.data.userEnteredFormat) === null || _a === void 0 ? void 0 : _a.textFormat) || {})), {
                italic: italic,
            }),
        });
    }
    setFormat(param) {
        this.data.userEnteredFormat = Object.assign(Object.assign({}, (this.data.userEnteredFormat || {})), param);
        return this;
    }
    exporse() {
        return this.data;
    }
}
exports.CellData = CellData;
class GoogleSpreadsheetAccessor {
    constructor(context) {
        this.context = context;
        this.spreadsheetContext = {
            sheetIdMap: new Map(),
        };
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
    updateValues(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const requests = [];
            yield Promise.all(params.requests.map((item) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                const rangeInfo = new data_util_1.RangeInfo(item.range || '');
                const sheetId = item.sheetId
                    ? item.sheetId
                    : yield this.getSheetIdByName({ spreadsheetId: params.spreadsheetId, sheetName: rangeInfo.name });
                if (item.properties) {
                    requests.push({
                        updateSheetProperties: {
                            fields: Object.keys(item.properties)
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                .filter((k) => item.properties[k] !== undefined)
                                .join(','),
                            properties: Object.assign({
                                sheetId: sheetId,
                            }, item.properties),
                        },
                    });
                }
                if (item.rows) {
                    const maxCol = ((_a = item.rows) === null || _a === void 0 ? void 0 : _a.map((row) => row.length).sort((a, b) => (a > b ? -1 : 1)).shift()) || 1;
                    const startCol = (0, data_util_1.getColumnByAlphabet)(rangeInfo.startColumn);
                    const startRow = rangeInfo.startRow;
                    const endCol = startCol + maxCol;
                    const endRow = startRow + (((_b = item.rows) === null || _b === void 0 ? void 0 : _b.length) || 1);
                    requests.push({
                        updateCells: (() => {
                            if (!item.rows) {
                                return undefined;
                            }
                            return {
                                fields: '*',
                                range: {
                                    sheetId: sheetId,
                                    startColumnIndex: startCol,
                                    startRowIndex: startRow,
                                    endColumnIndex: endCol,
                                    endRowIndex: endRow,
                                },
                                rows: item.rows.map((row) => ({
                                    values: row.map((value) => {
                                        if (value instanceof CellData) {
                                            return value.exporse();
                                        }
                                        return new CellData(value).exporse();
                                    }),
                                })),
                            };
                        })(),
                    });
                }
            })));
            yield this.context.apiRunner.withRetry(() => googleapis_1.google.sheets('v4').spreadsheets.batchUpdate({
                auth: this.context.authorizer.authorize(),
                spreadsheetId: params.spreadsheetId,
                requestBody: { requests: requests },
            }), (e) => {
                var _a;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if (((_a = e.response) === null || _a === void 0 ? void 0 : _a.status) === 404) {
                    return false;
                }
                return true;
            });
        });
    }
    setSheetProperties(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateRequests = yield Promise.all(params.requests.map((item) => __awaiter(this, void 0, void 0, function* () {
                const sheetId = item.sheetId
                    ? item.sheetId
                    : yield this.getSheetIdByName({ spreadsheetId: params.spreadsheetId, sheetName: item.sheetName || '' });
                return {
                    sheetId: sheetId,
                    properties: item.properties,
                };
            })));
            return this.updateValues({
                spreadsheetId: params.spreadsheetId,
                requests: updateRequests,
            });
        });
    }
    getSheetIdByName(params) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.spreadsheetContext.sheetIdMap.has(params.spreadsheetId)) {
                const response = yield this.context.apiRunner.withRetry(() => googleapis_1.google.sheets('v4').spreadsheets.get({
                    auth: this.context.authorizer.authorize(),
                    spreadsheetId: params.spreadsheetId,
                    includeGridData: false,
                }), (e) => {
                    var _a;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    if (((_a = e.response) === null || _a === void 0 ? void 0 : _a.status) === 404) {
                        return false;
                    }
                    return true;
                });
                const entries = (_a = response.data.sheets) === null || _a === void 0 ? void 0 : _a.map((item) => {
                    var _a, _b;
                    return [
                        (_a = item.properties) === null || _a === void 0 ? void 0 : _a.title,
                        (_b = item.properties) === null || _b === void 0 ? void 0 : _b.sheetId,
                    ];
                }).filter((pair) => pair[0] !== undefined && pair[0] !== null && pair[1] !== undefined && pair[1] !== null).map((pair) => [`${pair[0]}`, pair[1] || 0]);
                this.spreadsheetContext.sheetIdMap.set(params.spreadsheetId, new Map(entries || []));
            }
            const map = this.spreadsheetContext.sheetIdMap.get(params.spreadsheetId);
            if (!map) {
                throw new Error(`getSheetIdByName: spreadsheetId not found. ${params.spreadsheetId}`);
            }
            const sheetId = map.get(params.sheetName);
            if (!map) {
                throw new Error(`getSheetIdByName: sheetName not found. ${params.sheetName} @ ${params.spreadsheetId}`);
            }
            return sheetId;
        });
    }
}
exports.GoogleSpreadsheetAccessor = GoogleSpreadsheetAccessor;
