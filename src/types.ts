/** ForTem network environment */
export type FortemNetwork = "testnet" | "mainnet";

/** Options for createFortemClient() */
export interface FortemClientOptions {
  /** ForTem developer API key */
  apiKey: string;
  /** Network environment (default: 'mainnet') */
  network?: FortemNetwork;
  /** Custom fetch function (for testing) */
  fetch?: typeof globalThis.fetch;
}

/** Common API response structure */
export interface FortemResponse<T> {
  statusCode: number;
  data: T;
}

/** Nonce response */
export interface NonceResponse {
  nonce: string;
}

/** Access token response */
export interface AccessTokenResponse {
  accessToken: string;
}

/** Per-network configuration */
export interface NetworkConfig {
  apiBaseUrl: string;
  serviceUrl: string;
}

// ── Users API ──

/** User verification response */
export interface UserResponse {
  isUser: boolean;
  nickname: string;
  profileImage: string;
  walletAddress: string;
}

// ── Collections API ──

/** Collection object */
export interface Collection {
  id: number;
  objectId: string;
  name: string;
  description: string;
  tradeVolume: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Collection link */
export interface CollectionLink {
  website?: string;
}

/** Parameters for creating a collection */
export interface CreateCollectionParams {
  name: string;
  description: string;
  link?: CollectionLink;
}

// ── Items API ──

/** Item attribute */
export interface ItemAttribute {
  name: string;
  value: string;
}

/** Item owner */
export interface ItemOwner {
  nickname: string;
  walletAddress: string;
}

/** Item status */
export type ItemStatus = "PROCESSING" | "REDEEMED";

/** Item object */
export interface Item {
  id: number;
  objectId: string;
  name: string;
  description: string;
  nftNumber: number;
  itemImage: string;
  quantity: number;
  attributes: ItemAttribute[];
  owner: ItemOwner;
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
}

/** Parameters for creating an item */
export interface CreateItemParams {
  name: string;
  quantity: number;
  redeemCode: string;
  description: string;
  recipientAddress: string;
  itemImage?: string;
  attributes?: ItemAttribute[];
  redeemUrl?: string;
}

/** Image upload response */
export interface ImageUploadResponse {
  itemImage: string;
}
