import { FortemClient } from "./client";
import type { FortemClientOptions } from "./types";

/** Factory function to create a FortemClient instance */
export function createFortemClient(options: FortemClientOptions): FortemClient {
    return new FortemClient(options);
}

// Re-exports
export { FortemClient } from "./client";
export { FortemAuth } from "./auth";
export { FortemError, FortemAuthError } from "./errors";
export type {
    FortemClientOptions,
    FortemNetwork,
    FortemResponse,
    NonceResponse,
    AccessTokenResponse,
    NetworkConfig,
} from "./types";
