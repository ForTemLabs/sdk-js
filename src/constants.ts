import type { FortemNetwork, NetworkConfig } from "./types";

export const NETWORK_CONFIGS: Record<FortemNetwork, NetworkConfig> = {
  testnet: {
    apiBaseUrl: "https://testnet-api.fortem.gg",
    serviceUrl: "https://testnet.fortem.gg",
  },
  mainnet: {
    apiBaseUrl: "https://api.fortem.gg",
    serviceUrl: "https://fortem.gg",
  },
};

export const DEFAULT_NETWORK: FortemNetwork = "mainnet";
