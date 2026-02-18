import { describe, it, expect } from "vitest";
import { createFortemClient } from "../index";
import { createMockFetch } from "./helpers";

const TEST_API_KEY = "developer_test_dummy_key";
const TEST_NETWORK = "testnet" as const;

const sampleCollection = {
  id: 1,
  objectId: "obj-1",
  name: "Test Collection",
  description: "A test collection",
  tradeVolume: 100,
  itemCount: 5,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

describe("FortemCollections", () => {
  describe("list", () => {
    it("should return Collection[] on success", async () => {
      const mockFetch = createMockFetch([
        { status: 200, body: { statusCode: 200, data: { nonce: "nonce-1" } } },
        { status: 200, body: { statusCode: 200, data: { accessToken: "token-1" } } },
        { status: 200, body: { statusCode: 200, data: [sampleCollection] } },
      ]);
      const client = createFortemClient({ apiKey: TEST_API_KEY, network: TEST_NETWORK, fetch: mockFetch });

      const result = await client.collections.list();

      expect(result.data).toEqual([sampleCollection]);
    });

    it("should call correct endpoint with GET method", async () => {
      const mockFetch = createMockFetch([
        { status: 200, body: { statusCode: 200, data: { nonce: "nonce-1" } } },
        { status: 200, body: { statusCode: 200, data: { accessToken: "token-1" } } },
        { status: 200, body: { statusCode: 200, data: [] } },
      ]);
      const client = createFortemClient({ apiKey: TEST_API_KEY, network: TEST_NETWORK, fetch: mockFetch });

      await client.collections.list();

      const [url, init] = mockFetch.mock.calls[2];
      expect(url).toBe("https://testnet-api.fortem.gg/api/v1/developers/collections");
      expect(init?.method).toBe("GET");
    });

    it("should include Authorization Bearer header", async () => {
      const mockFetch = createMockFetch([
        { status: 200, body: { statusCode: 200, data: { nonce: "nonce-1" } } },
        { status: 200, body: { statusCode: 200, data: { accessToken: "my-token" } } },
        { status: 200, body: { statusCode: 200, data: [] } },
      ]);
      const client = createFortemClient({ apiKey: TEST_API_KEY, network: TEST_NETWORK, fetch: mockFetch });

      await client.collections.list();

      const [, init] = mockFetch.mock.calls[2];
      const headers = new Headers(init?.headers);
      expect(headers.get("Authorization")).toBe("Bearer my-token");
    });
  });

  describe("create", () => {
    it("should return Collection on success", async () => {
      const mockFetch = createMockFetch([
        { status: 200, body: { statusCode: 200, data: { nonce: "nonce-1" } } },
        { status: 200, body: { statusCode: 200, data: { accessToken: "token-1" } } },
        { status: 200, body: { statusCode: 200, data: sampleCollection } },
      ]);
      const client = createFortemClient({ apiKey: TEST_API_KEY, network: TEST_NETWORK, fetch: mockFetch });

      const result = await client.collections.create({ name: "Test", description: "Desc" });

      expect(result.data).toEqual(sampleCollection);
    });

    it("should send params as JSON body with POST method", async () => {
      const mockFetch = createMockFetch([
        { status: 200, body: { statusCode: 200, data: { nonce: "nonce-1" } } },
        { status: 200, body: { statusCode: 200, data: { accessToken: "token-1" } } },
        { status: 200, body: { statusCode: 200, data: sampleCollection } },
      ]);
      const client = createFortemClient({ apiKey: TEST_API_KEY, network: TEST_NETWORK, fetch: mockFetch });
      const params = { name: "My Collection", description: "Desc", link: { website: "https://example.com" } };

      await client.collections.create(params);

      const [url, init] = mockFetch.mock.calls[2];
      expect(url).toBe("https://testnet-api.fortem.gg/api/v1/developers/collections");
      expect(init?.method).toBe("POST");
      expect(init?.body).toBe(JSON.stringify(params));
    });

    it("should invalidate token cache after successful create", async () => {
      const mockFetch = createMockFetch([
        { status: 200, body: { statusCode: 200, data: { nonce: "nonce-1" } } },
        { status: 200, body: { statusCode: 200, data: { accessToken: "token-1" } } },
        { status: 200, body: { statusCode: 200, data: sampleCollection } },
      ]);
      const client = createFortemClient({ apiKey: TEST_API_KEY, network: TEST_NETWORK, fetch: mockFetch });

      await client.collections.create({ name: "Test", description: "Desc" });

      // Token should be cleared after minting
      expect(client.auth.getToken()).toBeNull();
    });
  });
});
