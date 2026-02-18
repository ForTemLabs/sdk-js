import { describe, it, expect } from "vitest";
import { createFortemClient } from "../index";
import { FortemError } from "../errors";
import { createMockFetch } from "./helpers";

const TEST_API_KEY = "developer_test_dummy_key";
const TEST_NETWORK = "testnet" as const;
const TEST_WALLET = "0xabc123";

describe("FortemUsers", () => {
  describe("verify", () => {
    it("should return UserResponse on success", async () => {
      const userData = {
        isUser: true,
        nickname: "testuser",
        profileImage: "https://example.com/img.png",
        walletAddress: TEST_WALLET,
      };
      const mockFetch = createMockFetch([
        // getValidToken → getNonce
        { status: 200, body: { statusCode: 200, data: { nonce: "nonce-1" } } },
        // getValidToken → getAccessToken
        { status: 200, body: { statusCode: 200, data: { accessToken: "token-1" } } },
        // verify
        { status: 200, body: { statusCode: 200, data: userData } },
      ]);
      const client = createFortemClient({ apiKey: TEST_API_KEY, network: TEST_NETWORK, fetch: mockFetch });

      const result = await client.users.verify(TEST_WALLET);

      expect(result.data).toEqual(userData);
    });

    it("should call correct endpoint with GET method", async () => {
      const mockFetch = createMockFetch([
        { status: 200, body: { statusCode: 200, data: { nonce: "nonce-1" } } },
        { status: 200, body: { statusCode: 200, data: { accessToken: "token-1" } } },
        { status: 200, body: { statusCode: 200, data: { isUser: true, nickname: "", profileImage: "", walletAddress: TEST_WALLET } } },
      ]);
      const client = createFortemClient({ apiKey: TEST_API_KEY, network: TEST_NETWORK, fetch: mockFetch });

      await client.users.verify(TEST_WALLET);

      // Third call is the verify request
      const [url, init] = mockFetch.mock.calls[2];
      expect(url).toBe(`https://testnet-api.fortem.gg/api/v1/developers/users/${TEST_WALLET}`);
      expect(init?.method).toBe("GET");
    });

    it("should include Authorization Bearer header", async () => {
      const mockFetch = createMockFetch([
        { status: 200, body: { statusCode: 200, data: { nonce: "nonce-1" } } },
        { status: 200, body: { statusCode: 200, data: { accessToken: "bearer-token-xyz" } } },
        { status: 200, body: { statusCode: 200, data: { isUser: true, nickname: "", profileImage: "", walletAddress: TEST_WALLET } } },
      ]);
      const client = createFortemClient({ apiKey: TEST_API_KEY, network: TEST_NETWORK, fetch: mockFetch });

      await client.users.verify(TEST_WALLET);

      const [, init] = mockFetch.mock.calls[2];
      const headers = new Headers(init?.headers);
      expect(headers.get("Authorization")).toBe("Bearer bearer-token-xyz");
    });

    it("should throw FortemError on 404", async () => {
      const mockFetch = createMockFetch([
        { status: 200, body: { statusCode: 200, data: { nonce: "nonce-1" } } },
        { status: 200, body: { statusCode: 200, data: { accessToken: "token-1" } } },
        { status: 404, body: { statusCode: 404, message: "User not found" } },
      ]);
      const client = createFortemClient({ apiKey: TEST_API_KEY, network: TEST_NETWORK, fetch: mockFetch });

      await expect(client.users.verify(TEST_WALLET)).rejects.toThrow(
        expect.objectContaining({
          name: "FortemError",
          message: "User not found",
          statusCode: 404,
        })
      );
    });

    it("should retry once on 403 with fresh token", async () => {
      const mockFetch = createMockFetch([
        // getValidToken → getNonce
        { status: 200, body: { statusCode: 200, data: { nonce: "nonce-1" } } },
        // getValidToken → getAccessToken
        { status: 200, body: { statusCode: 200, data: { accessToken: "old-token" } } },
        // verify → 403
        { status: 403, body: { statusCode: 403, message: "Token expired" } },
        // retry: getValidToken → getNonce (after clearToken)
        { status: 200, body: { statusCode: 200, data: { nonce: "nonce-2" } } },
        // retry: getValidToken → getAccessToken
        { status: 200, body: { statusCode: 200, data: { accessToken: "new-token" } } },
        // retry: verify → success
        { status: 200, body: { statusCode: 200, data: { isUser: true, nickname: "user", profileImage: "", walletAddress: TEST_WALLET } } },
      ]);
      const client = createFortemClient({ apiKey: TEST_API_KEY, network: TEST_NETWORK, fetch: mockFetch });

      const result = await client.users.verify(TEST_WALLET);

      expect(result.data.isUser).toBe(true);
      // 6 total fetch calls: 2 (auth) + 1 (403) + 2 (re-auth) + 1 (retry)
      expect(mockFetch).toHaveBeenCalledTimes(6);
      // Retry request should use new token
      const [, retryInit] = mockFetch.mock.calls[5];
      const retryHeaders = new Headers(retryInit?.headers);
      expect(retryHeaders.get("Authorization")).toBe("Bearer new-token");
    });
  });
});
