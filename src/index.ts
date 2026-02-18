import { FortemClient } from "./client";
import type { FortemClientOptions } from "./types";

/** Factory function to create a FortemClient instance */
export function createFortemClient(options: FortemClientOptions): FortemClient {
    return new FortemClient(options);
}

// Re-exports
export { FortemClient } from "./client";
export { FortemAuth } from "./auth";
export { FortemUsers } from "./users";
export { FortemCollections } from "./collections";
export { FortemItems } from "./items";
export { FortemError, FortemAuthError, FortemTokenExpiredError } from "./errors";
export type {
    FortemClientOptions,
    FortemNetwork,
    FortemResponse,
    NonceResponse,
    AccessTokenResponse,
    NetworkConfig,
    UserResponse,
    Collection,
    CollectionLink,
    CreateCollectionParams,
    Item,
    ItemAttribute,
    ItemOwner,
    ItemStatus,
    CreateItemParams,
    ImageUploadResponse,
} from "./types";
