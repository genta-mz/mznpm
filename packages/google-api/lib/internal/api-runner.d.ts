export interface ErrorConfig {
    useExponentialBackoff?: boolean;
    retryCount?: number;
}
export declare class APIRunner {
    private readonly errorConfig?;
    constructor(errorConfig?: ErrorConfig);
    withRetry<T>(f: () => Promise<T>, retryable?: (e: unknown) => boolean): Promise<T>;
}
