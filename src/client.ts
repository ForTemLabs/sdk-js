import { FortemAuth } from "./auth";
import { NETWORK_CONFIGS, DEFAULT_NETWORK } from "./constants";
import { createFetchWithApiKey, type Fetch } from "./fetch";
import type { FortemClientOptions, NetworkConfig } from "./types";

export class FortemClient {
  readonly auth: FortemAuth;

  private readonly _fetch: Fetch;
  private readonly _networkConfig: NetworkConfig;

  constructor(options: FortemClientOptions) {
    if (!options.apiKey || typeof options.apiKey !== "string") {
      throw new Error("apiKey is required");
    }

    if (options.apiKey.trim().length === 0) {
      throw new Error("apiKey cannot be empty");
    }

    const network = options.network ?? DEFAULT_NETWORK;
    this._networkConfig = NETWORK_CONFIGS[network];
    this._fetch = createFetchWithApiKey(options.apiKey, options.fetch);

    // Initialize sub-modules
    this.auth = new FortemAuth(this._networkConfig.apiBaseUrl, this._fetch);
  }

  /** API base URL for the current network */
  get apiBaseUrl(): string {
    return this._networkConfig.apiBaseUrl;
  }

  /** Service URL for the current network */
  get serviceUrl(): string {
    return this._networkConfig.serviceUrl;
  }
}
