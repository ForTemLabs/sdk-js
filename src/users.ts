import { parseResponse, type Fetch } from "./fetch";
import type { UserResponse, FortemResponse } from "./types";

export class FortemUsers {
  constructor(
    private readonly _apiBaseUrl: string,
    private readonly _fetch: Fetch
  ) {}

  /**
   * Verify if a wallet address is a registered ForTem user.
   *
   * @param walletAddress - The wallet address to verify
   * @returns User information if found
   */
  async verify(walletAddress: string): Promise<FortemResponse<UserResponse>> {
    const response = await this._fetch(
      `${this._apiBaseUrl}/api/v1/developers/users/${walletAddress}`,
      { method: "GET" }
    );
    return parseResponse<UserResponse>(response);
  }
}
