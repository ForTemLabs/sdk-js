import { describe, it, expect } from "vitest";
import { createFortemClient } from "../index";
import { createMockFetch } from "./helpers";

const TEST_API_KEY = "developer_test_dummy_key";
const TEST_NETWORK = "testnet" as const;
const COLLECTION_ID = 42;

const sampleItem = {
  id: 1,
  objectId: "item-obj-1",
  name: "Test Item",
  description: "A test item",
  nftNumber: 100,
  itemImage: "https://example.com/item.png",
  quantity: 1,
  attributes: [{ name: "color", value: "blue" }],
  owner: { nickname: "owner1", walletAddress: "0xowner" },
  status: "PROCESSING" as const,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

describe("FortemItems", () => {
  describe("get", () => {
    it("should return Item on success", async () => {
      const mockFetch = createMockFetch([
        { status: 200, body: { statusCode: 200, data: { nonce: "nonce-1" } } },
        { status: 200, body: { statusCode: 200, data: { accessToken: "token-1" } } },
        { status: 200, body: { statusCode: 200, data: sampleItem } },
      ]);
      const client = createFortemClient({ apiKey: TEST_API_KEY, network: TEST_NETWORK, fetch: mockFetch });

      const result = await client.items.get(COLLECTION_ID, "REDEEM123");

      expect(result.data).toEqual(sampleItem);
    });

    it("should call correct endpoint with GET method", async () => {
      const mockFetch = createMockFetch([
        { status: 200, body: { statusCode: 200, data: { nonce: "nonce-1" } } },
        { status: 200, body: { statusCode: 200, data: { accessToken: "token-1" } } },
        { status: 200, body: { statusCode: 200, data: sampleItem } },
      ]);
      const client = createFortemClient({ apiKey: TEST_API_KEY, network: TEST_NETWORK, fetch: mockFetch });

      await client.items.get(COLLECTION_ID, "CODE1");

      const [url, init] = mockFetch.mock.calls[2];
      expect(url).toBe(`https://testnet-api.fortem.gg/api/v1/developers/collections/${COLLECTION_ID}/items/CODE1`);
      expect(init?.method).toBe("GET");
    });

    it("should include Authorization Bearer header", async () => {
      const mockFetch = createMockFetch([
        { status: 200, body: { statusCode: 200, data: { nonce: "nonce-1" } } },
        { status: 200, body: { statusCode: 200, data: { accessToken: "item-token" } } },
        { status: 200, body: { statusCode: 200, data: sampleItem } },
      ]);
      const client = createFortemClient({ apiKey: TEST_API_KEY, network: TEST_NETWORK, fetch: mockFetch });

      await client.items.get(COLLECTION_ID, "CODE1");

      const [, init] = mockFetch.mock.calls[2];
      const headers = new Headers(init?.headers);
      expect(headers.get("Authorization")).toBe("Bearer item-token");
    });
  });

  describe("create", () => {
    it("should return Item on success", async () => {
      const mockFetch = createMockFetch([
        { status: 200, body: { statusCode: 200, data: { nonce: "nonce-1" } } },
        { status: 200, body: { statusCode: 200, data: { accessToken: "token-1" } } },
        { status: 200, body: { statusCode: 200, data: sampleItem } },
      ]);
      const client = createFortemClient({ apiKey: TEST_API_KEY, network: TEST_NETWORK, fetch: mockFetch });
      const params = {
        name: "Item",
        quantity: 1,
        redeemCode: "CODE",
        description: "Desc",
        recipientAddress: "0xrecipient",
      };

      const result = await client.items.create(COLLECTION_ID, params);

      expect(result.data).toEqual(sampleItem);
    });

    it("should send params as JSON body with POST method", async () => {
      const mockFetch = createMockFetch([
        { status: 200, body: { statusCode: 200, data: { nonce: "nonce-1" } } },
        { status: 200, body: { statusCode: 200, data: { accessToken: "token-1" } } },
        { status: 200, body: { statusCode: 200, data: sampleItem } },
      ]);
      const client = createFortemClient({ apiKey: TEST_API_KEY, network: TEST_NETWORK, fetch: mockFetch });
      const params = {
        name: "Item",
        quantity: 1,
        redeemCode: "CODE",
        description: "Desc",
        recipientAddress: "0xrecipient",
      };

      await client.items.create(COLLECTION_ID, params);

      const [url, init] = mockFetch.mock.calls[2];
      expect(url).toBe(`https://testnet-api.fortem.gg/api/v1/developers/collections/${COLLECTION_ID}/items`);
      expect(init?.method).toBe("POST");
      expect(init?.body).toBe(JSON.stringify(params));
    });

    it("should invalidate token cache after successful create", async () => {
      const mockFetch = createMockFetch([
        { status: 200, body: { statusCode: 200, data: { nonce: "nonce-1" } } },
        { status: 200, body: { statusCode: 200, data: { accessToken: "token-1" } } },
        { status: 200, body: { statusCode: 200, data: sampleItem } },
      ]);
      const client = createFortemClient({ apiKey: TEST_API_KEY, network: TEST_NETWORK, fetch: mockFetch });

      await client.items.create(COLLECTION_ID, {
        name: "Item",
        quantity: 1,
        redeemCode: "CODE",
        description: "Desc",
        recipientAddress: "0xrecipient",
      });

      expect(client.auth.getToken()).toBeNull();
    });
  });

  describe("uploadImage", () => {
    it("should return ImageUploadResponse on success", async () => {
      const mockFetch = createMockFetch([
        { status: 200, body: { statusCode: 200, data: { nonce: "nonce-1" } } },
        { status: 200, body: { statusCode: 200, data: { accessToken: "token-1" } } },
        { status: 200, body: { statusCode: 200, data: { itemImage: "https://cdn.example.com/img.png" } } },
      ]);
      const client = createFortemClient({ apiKey: TEST_API_KEY, network: TEST_NETWORK, fetch: mockFetch });
      const file = new Blob(["image-data"], { type: "image/png" });

      const result = await client.items.uploadImage(COLLECTION_ID, file);

      expect(result.data.itemImage).toBe("https://cdn.example.com/img.png");
    });

    it("should send body as FormData with PUT method", async () => {
      const mockFetch = createMockFetch([
        { status: 200, body: { statusCode: 200, data: { nonce: "nonce-1" } } },
        { status: 200, body: { statusCode: 200, data: { accessToken: "token-1" } } },
        { status: 200, body: { statusCode: 200, data: { itemImage: "url" } } },
      ]);
      const client = createFortemClient({ apiKey: TEST_API_KEY, network: TEST_NETWORK, fetch: mockFetch });
      const file = new Blob(["data"], { type: "image/png" });

      await client.items.uploadImage(COLLECTION_ID, file);

      const [url, init] = mockFetch.mock.calls[2];
      expect(url).toBe(`https://testnet-api.fortem.gg/api/v1/developers/collections/${COLLECTION_ID}/items/image-upload`);
      expect(init?.method).toBe("PUT");
      expect(init?.body).toBeInstanceOf(FormData);
    });

    it("should not set Content-Type to application/json for FormData uploads", async () => {
      const mockFetch = createMockFetch([
        { status: 200, body: { statusCode: 200, data: { nonce: "nonce-1" } } },
        { status: 200, body: { statusCode: 200, data: { accessToken: "token-1" } } },
        { status: 200, body: { statusCode: 200, data: { itemImage: "url" } } },
      ]);
      const client = createFortemClient({ apiKey: TEST_API_KEY, network: TEST_NETWORK, fetch: mockFetch });
      const file = new Blob(["data"], { type: "image/png" });

      await client.items.uploadImage(COLLECTION_ID, file);

      const [, init] = mockFetch.mock.calls[2];
      const headers = new Headers(init?.headers);
      expect(headers.get("Content-Type")).not.toBe("application/json");
    });
  });
});
