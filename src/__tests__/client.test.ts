import { describe, it, expect } from "vitest";
import { createFortemClient, FortemClient } from "../index";

const MAINNET_API_KEY = "developer_mainnet_dummy_key";
const TESTNET_API_KEY = "developer_testnet_dummy_key";
const TEST_NETWORK = "testnet" as const;

describe("FortemClient", () => {
  it("should create client with default network (mainnet)", () => {
    const client = createFortemClient({ apiKey: MAINNET_API_KEY });

    expect(client).toBeInstanceOf(FortemClient);
    expect(client.apiBaseUrl).toBe("https://api.fortem.gg");
    expect(client.serviceUrl).toBe("https://fortem.gg");
  });

  it("should create client with testnet", () => {
    const client = createFortemClient({ apiKey: TESTNET_API_KEY, network: TEST_NETWORK });

    expect(client.apiBaseUrl).toBe("https://testnet-api.fortem.gg");
    expect(client.serviceUrl).toBe("https://testnet.fortem.gg");
  });

  it("should throw when apiKey is missing", () => {
    expect(() => createFortemClient({} as any)).toThrow("apiKey is required");
  });

  it("should throw when apiKey is empty string", () => {
    expect(() => createFortemClient({ apiKey: "  " })).toThrow("apiKey cannot be empty");
  });

  it("should have auth sub-module", () => {
    const client = createFortemClient({ apiKey: TESTNET_API_KEY, network: TEST_NETWORK });
    expect(client.auth).toBeDefined();
  });

  it("should have users sub-module", () => {
    const client = createFortemClient({ apiKey: TESTNET_API_KEY, network: TEST_NETWORK });
    expect(client.users).toBeDefined();
  });

  it("should have collections sub-module", () => {
    const client = createFortemClient({ apiKey: TESTNET_API_KEY, network: TEST_NETWORK });
    expect(client.collections).toBeDefined();
  });

  it("should have items sub-module", () => {
    const client = createFortemClient({ apiKey: TESTNET_API_KEY, network: TEST_NETWORK });
    expect(client.items).toBeDefined();
  });
});
