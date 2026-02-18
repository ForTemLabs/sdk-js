import { parseResponse, type Fetch } from "./fetch";
import type {
  Item,
  CreateItemParams,
  ImageUploadResponse,
  FortemResponse,
} from "./types";
import type { FortemAuth } from "./auth";

export class FortemItems {
  constructor(
    private readonly _apiBaseUrl: string,
    private readonly _fetch: Fetch,
    private readonly _auth: FortemAuth
  ) {}

  /**
   * Get an item by its redeem code.
   *
   * @param collectionId - The collection ID
   * @param code - The redeem code
   */
  async get(collectionId: number, code: string): Promise<FortemResponse<Item>> {
    const response = await this._fetch(
      `${this._apiBaseUrl}/api/v1/developers/collections/${collectionId}/items/${code}`,
      { method: "GET" }
    );
    return parseResponse<Item>(response);
  }

  /**
   * Create a new item in a collection.
   * Note: This consumes the current access token (minting operation).
   *
   * @param collectionId - The collection ID
   * @param params - Item creation parameters
   */
  async create(
    collectionId: number,
    params: CreateItemParams
  ): Promise<FortemResponse<Item>> {
    const response = await this._fetch(
      `${this._apiBaseUrl}/api/v1/developers/collections/${collectionId}/items`,
      {
        method: "POST",
        body: JSON.stringify(params),
      }
    );
    const result = await parseResponse<Item>(response);

    // Proactively invalidate cached token after minting
    this._auth.clearToken();

    return result;
  }

  /**
   * Upload an image for an item.
   *
   * @param collectionId - The collection ID
   * @param file - Image file (Blob or File)
   */
  async uploadImage(
    collectionId: number,
    file: Blob
  ): Promise<FortemResponse<ImageUploadResponse>> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await this._fetch(
      `${this._apiBaseUrl}/api/v1/developers/collections/${collectionId}/items/image-upload`,
      {
        method: "PUT",
        body: formData,
      }
    );
    return parseResponse<ImageUploadResponse>(response);
  }
}
