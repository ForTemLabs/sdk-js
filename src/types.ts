/** ForTem network environment */
export type FortemNetwork = "testnet" | "mainnet";

/** Options for createFortemClient() */
export interface FortemClientOptions {
  /** ForTem developer API key */
  apiKey: string;
  /** Network environment (default: 'mainnet') */
  network?: FortemNetwork;
  /** Custom fetch function (for testing) */
  fetch?: typeof globalThis.fetch;
}

/** Common API response structure */
export interface FortemResponse<T> {
  statusCode: number;
  data: T;
}

/** Nonce response */
export interface NonceResponse {
  nonce: string;
}

/** Access token response */
export interface AccessTokenResponse {
  accessToken: string;
}

/** Per-network configuration */
export interface NetworkConfig {
  apiBaseUrl: string;
  serviceUrl: string;
}
