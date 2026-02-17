import { FortemAuthError } from "./errors";
import { parseResponse, type Fetch } from "./fetch";
import type { NonceResponse, AccessTokenResponse } from "./types";

export class FortemAuth {
  private _accessToken: string | null = null;
  private _expiresAt: number | null = null;

  /** Expiry margin — treat token as expired 30s before actual expiration */
  private static readonly TOKEN_EXPIRY_MARGIN_MS = 30_000;
  /** Access token TTL (5 minutes) */
  private static readonly TOKEN_TTL_MS = 5 * 60 * 1000;

  constructor(
    private readonly _apiBaseUrl: string,
    private readonly _fetch: Fetch
  ) {}

  /**
   * Step 1: Request a nonce
   *
   * Requests an authentication nonce from the ForTem API.
   *
   * @returns An object containing the nonce string
   */
  async getNonce(): Promise<{ nonce: string }> {
    const response = await this._fetch(
      `${this._apiBaseUrl}/api/v1/developers/auth/nonce`,
      { method: "POST" }
    );

    const result = await parseResponse<NonceResponse>(response);
    return { nonce: result.data.nonce };
  }

  /**
   * Step 2: Obtain an access token
   *
   * Exchanges a nonce for an access token.
   * The acquired token is cached internally.
   *
   * @param nonce - The nonce obtained from getNonce()
   * @returns An object containing the accessToken string
   */
  async getAccessToken(nonce: string): Promise<{ accessToken: string }> {
    if (!nonce) {
      throw new FortemAuthError("nonce is required");
    }

    const response = await this._fetch(
      `${this._apiBaseUrl}/api/v1/developers/auth/access-token`,
      {
        method: "POST",
        body: JSON.stringify({ nonce }),
      }
    );

    const result = await parseResponse<AccessTokenResponse>(response);
    const { accessToken } = result.data;

    // Cache internally
    this._accessToken = accessToken;
    this._expiresAt = Date.now() + FortemAuth.TOKEN_TTL_MS;

    return { accessToken };
  }

  /**
   * Returns the cached access token.
   *
   * Returns null if no token is cached or if it has expired.
   * Treats the token as expired 30 seconds before actual expiration (margin applied).
   */
  getToken(): string | null {
    if (!this._accessToken || !this._expiresAt) {
      return null;
    }

    if (Date.now() >= this._expiresAt - FortemAuth.TOKEN_EXPIRY_MARGIN_MS) {
      this._accessToken = null;
      this._expiresAt = null;
      return null;
    }

    return this._accessToken;
  }

  /**
   * Returns a valid access token, auto-refreshing if necessary.
   *
   * Returns the cached token if still valid.
   * If expired, automatically executes the nonce → access token two-step flow.
   */
  async getValidToken(): Promise<string> {
    const cached = this.getToken();
    if (cached) return cached;

    const { nonce } = await this.getNonce();
    const { accessToken } = await this.getAccessToken(nonce);
    return accessToken;
  }

  /** Clears the cached token */
  clearToken(): void {
    this._accessToken = null;
    this._expiresAt = null;
  }
}
