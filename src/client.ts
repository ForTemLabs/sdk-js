import { FortemAuth } from "./auth";
import { NETWORK_CONFIGS, DEFAULT_NETWORK, TOKEN_EXPIRED_STATUS } from "./constants";
import { createFetchWithApiKey, type Fetch } from "./fetch";
import type { FortemClientOptions, NetworkConfig } from "./types";
import { FortemUsers } from "./users";
import { FortemCollections } from "./collections";
import { FortemItems } from "./items";

export class FortemClient {
  readonly auth: FortemAuth;
  readonly users: FortemUsers;
  readonly collections: FortemCollections;
  readonly items: FortemItems;

  private readonly _fetch: Fetch;
  private readonly _authenticatedFetch: Fetch;
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
    this._authenticatedFetch = this._createAuthenticatedFetch();
    this.users = new FortemUsers(this._networkConfig.apiBaseUrl, this._authenticatedFetch);
    this.collections = new FortemCollections(this._networkConfig.apiBaseUrl, this._authenticatedFetch, this.auth);
    this.items = new FortemItems(this._networkConfig.apiBaseUrl, this._authenticatedFetch, this.auth);
  }

  /**
   * Creates a fetch wrapper that:
   * 1. Injects Authorization: Bearer <token> header via auth.getValidToken()
   * 2. On 403 response: clears token, re-fetches new token, retries once
   */
  private _createAuthenticatedFetch(): Fetch {
    return async (input, init) => {
      const token = await this.auth.getValidToken();
      const headers = new Headers(init?.headers);
      headers.set("Authorization", `Bearer ${token}`);

      const response = await this._fetch(input, { ...init, headers });

      if (response.status === TOKEN_EXPIRED_STATUS) {
        this.auth.clearToken();
        const newToken = await this.auth.getValidToken();
        const retryHeaders = new Headers(init?.headers);
        retryHeaders.set("Authorization", `Bearer ${newToken}`);
        return this._fetch(input, { ...init, headers: retryHeaders });
      }

      return response;
    };
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
