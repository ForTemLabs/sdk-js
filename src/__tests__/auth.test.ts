import { describe, it, expect, vi, beforeEach } from "vitest";
import { createFortemClient } from "../index";
import { FortemAuthError, FortemError } from "../errors";

const TEST_API_KEY = "developer_m4c1aj741e_b4b8446a0bff521";
const TEST_NETWORK = "testnet" as const;

function createMockFetch(responses: Array<{ status: number; body: unknown }>) {
  let callIndex = 0;
  return vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => {
    const res = responses[callIndex++];
    return {
      ok: res.status >= 200 && res.status < 300,
      status: res.status,
      json: async () => res.body,
      headers: new Headers(),
    } as Response;
  });
}

describe("FortemAuth", () => {
  describe("getNonce", () => {
    it("should return nonce from API", async () => {
      const mockFetch = createMockFetch([
        { status: 200, body: { statusCode: 200, data: { nonce: "test-nonce-123" } } },
      ]);
      const client = createFortemClient({ apiKey: TEST_API_KEY, network: TEST_NETWORK, fetch: mockFetch });

      const result = await client.auth.getNonce();

      expect(result.nonce).toBe("test-nonce-123");
      expect(mockFetch).toHaveBeenCalledOnce();
    });

    it("should include x-api-key header", async () => {
      const mockFetch = createMockFetch([
        { status: 200, body: { statusCode: 200, data: { nonce: "abc" } } },
      ]);
      const client = createFortemClient({ apiKey: TEST_API_KEY, network: TEST_NETWORK, fetch: mockFetch });

      await client.auth.getNonce();

      const [, init] = mockFetch.mock.calls[0];
      const headers = new Headers(init?.headers);
      expect(headers.get("x-api-key")).toBe(TEST_API_KEY);
    });

    it("should throw FortemAuthError on 401 (invalid API key)", async () => {
      const mockFetch = createMockFetch([
        { status: 401, body: { statusCode: 401, message: "Invalid API key" } },
      ]);
      const client = createFortemClient({ apiKey: "bad-key", network: TEST_NETWORK, fetch: mockFetch });

      await expect(client.auth.getNonce()).rejects.toThrow(
        expect.objectContaining({
          name: "FortemAuthError",
          message: "Invalid API key",
        })
      );
    });

    it("should throw FortemError on other API errors", async () => {
      const mockFetch = createMockFetch([
        { status: 500, body: { statusCode: 500, message: "Internal Server Error" } },
      ]);
      const client = createFortemClient({ apiKey: TEST_API_KEY, network: TEST_NETWORK, fetch: mockFetch });

      await expect(client.auth.getNonce()).rejects.toThrow(FortemError);
    });
  });

  describe("getAccessToken", () => {
    it("should return access token", async () => {
      const mockFetch = createMockFetch([
        { status: 200, body: { statusCode: 200, data: { accessToken: "jwt-token-xyz" } } },
      ]);
      const client = createFortemClient({ apiKey: TEST_API_KEY, network: TEST_NETWORK, fetch: mockFetch });

      const result = await client.auth.getAccessToken("test-nonce");

      expect(result.accessToken).toBe("jwt-token-xyz");
    });

    it("should throw FortemAuthError when nonce is empty", async () => {
      const client = createFortemClient({ apiKey: TEST_API_KEY, network: TEST_NETWORK });

      await expect(client.auth.getAccessToken("")).rejects.toThrow(FortemAuthError);
    });

    it("should cache the token internally", async () => {
      const mockFetch = createMockFetch([
        { status: 200, body: { statusCode: 200, data: { accessToken: "cached-token" } } },
      ]);
      const client = createFortemClient({ apiKey: TEST_API_KEY, network: TEST_NETWORK, fetch: mockFetch });

      await client.auth.getAccessToken("nonce");

      expect(client.auth.getToken()).toBe("cached-token");
    });
  });

  describe("getToken", () => {
    it("should return null when no token cached", () => {
      const client = createFortemClient({ apiKey: TEST_API_KEY, network: TEST_NETWORK });
      expect(client.auth.getToken()).toBeNull();
    });

    it("should return null when token expired", async () => {
      const mockFetch = createMockFetch([
        { status: 200, body: { statusCode: 200, data: { accessToken: "token" } } },
      ]);
      const client = createFortemClient({ apiKey: TEST_API_KEY, network: TEST_NETWORK, fetch: mockFetch });
      await client.auth.getAccessToken("nonce");

      // Advance time by 5 minutes + 1 second
      vi.useFakeTimers();
      vi.advanceTimersByTime(5 * 60 * 1000 + 1000);

      expect(client.auth.getToken()).toBeNull();

      vi.useRealTimers();
    });
  });

  describe("getValidToken", () => {
    it("should return cached token if valid", async () => {
      const mockFetch = createMockFetch([
        { status: 200, body: { statusCode: 200, data: { accessToken: "valid-token" } } },
      ]);
      const client = createFortemClient({ apiKey: TEST_API_KEY, network: TEST_NETWORK, fetch: mockFetch });
      await client.auth.getAccessToken("nonce");

      const token = await client.auth.getValidToken();

      expect(token).toBe("valid-token");
      // fetch called only once in getAccessToken (no additional call from getValidToken)
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("should auto-refresh when token expired", async () => {
      const mockFetch = createMockFetch([
        // First getAccessToken call
        { status: 200, body: { statusCode: 200, data: { accessToken: "old-token" } } },
        // getValidToken → getNonce (auto-refresh)
        { status: 200, body: { statusCode: 200, data: { nonce: "new-nonce" } } },
        // getValidToken → getAccessToken (auto-refresh)
        { status: 200, body: { statusCode: 200, data: { accessToken: "new-token" } } },
      ]);
      const client = createFortemClient({ apiKey: TEST_API_KEY, network: TEST_NETWORK, fetch: mockFetch });
      await client.auth.getAccessToken("nonce");

      // Simulate token expiration
      client.auth.clearToken();

      const token = await client.auth.getValidToken();

      expect(token).toBe("new-token");
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });

  describe("clearToken", () => {
    it("should clear cached token", async () => {
      const mockFetch = createMockFetch([
        { status: 200, body: { statusCode: 200, data: { accessToken: "token" } } },
      ]);
      const client = createFortemClient({ apiKey: TEST_API_KEY, network: TEST_NETWORK, fetch: mockFetch });
      await client.auth.getAccessToken("nonce");

      client.auth.clearToken();

      expect(client.auth.getToken()).toBeNull();
    });
  });
});
