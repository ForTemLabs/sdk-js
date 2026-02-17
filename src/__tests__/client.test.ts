import { describe, it, expect } from "vitest";
import { createFortemClient, FortemClient } from "../index";

const MAINNET_API_KEY = "developer_m2uibue9e2_2b2de7c0e08c652";
const TESTNET_API_KEY = "developer_m4c1aj741e_b4b8446a0bff521";
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
});
