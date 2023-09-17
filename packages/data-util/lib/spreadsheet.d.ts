export declare const getAlphabetByColumn: (column: number) => string;
export declare const getColumnByAlphabet: (str: string) => number;
export declare const parseAddressStr: (str: string) => {
    column?: undefined;
    row?: undefined;
} | {
    column: string | undefined;
    row: number | "" | undefined;
};
export declare class RangeInfo {
    readonly range: string;
    readonly name: string;
    readonly startColumn: string;
    readonly startRow: number;
    readonly endColumn: string;
    readonly endRow: number;
    constructor(range: string);
    calcDistance(other: RangeInfo): number;
}
