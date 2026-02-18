import { parseResponse, type Fetch } from "./fetch";
import type { Collection, CreateCollectionParams, FortemResponse } from "./types";
import type { FortemAuth } from "./auth";

export class FortemCollections {
  constructor(
    private readonly _apiBaseUrl: string,
    private readonly _fetch: Fetch,
    private readonly _auth: FortemAuth
  ) {}

  /**
   * List all collections.
   */
  async list(): Promise<FortemResponse<Collection[]>> {
    const response = await this._fetch(
      `${this._apiBaseUrl}/api/v1/developers/collections`,
      { method: "GET" }
    );
    return parseResponse<Collection[]>(response);
  }

  /**
   * Create a new collection.
   * Note: This consumes the current access token (minting operation).
   *
   * @param params - Collection creation parameters
   */
  async create(params: CreateCollectionParams): Promise<FortemResponse<Collection>> {
    const response = await this._fetch(
      `${this._apiBaseUrl}/api/v1/developers/collections`,
      {
        method: "POST",
        body: JSON.stringify(params),
      }
    );
    const result = await parseResponse<Collection>(response);

    // Proactively invalidate cached token after minting
    this._auth.clearToken();

    return result;
  }
}
