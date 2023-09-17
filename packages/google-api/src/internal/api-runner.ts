export interface ErrorConfig {
  useExponentialBackoff?: boolean;
  retryCount?: number;
  logError?: boolean;
}

export class APIRunner {
  private readonly errorConfig?: ErrorConfig;

  constructor(errorConfig?: ErrorConfig) {
    this.errorConfig = errorConfig;
  }

  public async withRetry<T>(f: () => Promise<T>, retryable: (e: unknown) => boolean = () => true) {
    let error: unknown = undefined;

    for (let i = 0; i < (this.errorConfig?.retryCount || 5); ++i) {
      try {
        const res = await f();
        return res;
      } catch (e) {
        error = e;

        if (!retryable(e)) {
          break;
        }

        if (this.errorConfig?.useExponentialBackoff) {
          const interval = Math.pow(2, i) * 1000 + Math.random() * 1000;
          await (async () => new Promise((resolve) => setTimeout(resolve, interval)))();
        }
      }
    }

    throw new Error(`${error}`);
  }
}
