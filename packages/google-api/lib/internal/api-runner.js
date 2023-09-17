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
exports.APIRunner = void 0;
class APIRunner {
    constructor(errorConfig) {
        this.errorConfig = errorConfig;
    }
    withRetry(f, retryable = () => true) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            let error = undefined;
            for (let i = 0; i < (((_a = this.errorConfig) === null || _a === void 0 ? void 0 : _a.retryCount) || 5); ++i) {
                try {
                    const res = yield f();
                    return res;
                }
                catch (e) {
                    error = e;
                    if (!retryable(e)) {
                        break;
                    }
                    if ((_b = this.errorConfig) === null || _b === void 0 ? void 0 : _b.useExponentialBackoff) {
                        const interval = Math.pow(2, i) * 1000 + Math.random() * 1000;
                        yield (() => __awaiter(this, void 0, void 0, function* () { return new Promise((resolve) => setTimeout(resolve, interval)); }))();
                    }
                }
            }
            throw new Error(`${error}`);
        });
    }
}
exports.APIRunner = APIRunner;
