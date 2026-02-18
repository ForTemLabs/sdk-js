# @fortemlabs/sdk-js

ForTem SDK for JavaScript/TypeScript — NFT marketplace API client for the Sui blockchain.

## Installation

```bash
npm install @fortemlabs/sdk-js
```

<details>
<summary>pnpm / yarn</summary>

```bash
pnpm install @fortemlabs/sdk-js
# or
yarn add @fortemlabs/sdk-js
```

</details>

## Quick Start

```typescript
import { createFortemClient } from '@fortemlabs/sdk-js'

// 1. Create client
const fortem = createFortemClient({ apiKey: 'your-api-key' })

// 2. Authenticate
const { data: { nonce } } = await fortem.auth.getNonce()
await fortem.auth.getAccessToken(nonce)

// 3. Use the API
const { data: collections } = await fortem.collections.list()
```

> All authenticated requests (`users`, `collections`, `items`) automatically inject the Bearer token. You only need to authenticate once.

## Overview

```
fortem
├── auth            Authentication & token management
├── users           User verification
├── collections     Collection CRUD
└── items           Item CRUD & image upload
```

| Module | Method | Description |
|--------|--------|-------------|
| **auth** | `getNonce()` | Get authentication nonce |
| | `getAccessToken(nonce)` | Exchange nonce for access token |
| | `getValidToken()` | Get valid token (auto-refresh) |
| | `getToken()` | Get cached token or `null` |
| | `clearToken()` | Clear cached token |
| **users** | `verify(walletAddress)` | Check if wallet is registered |
| **collections** | `list()` | List all collections |
| | `create(params)` | Create a collection |
| **items** | `get(collectionId, code)` | Get item by redeem code |
| | `create(collectionId, params)` | Create an item |
| | `uploadImage(collectionId, file)` | Upload item image |

## Rate Limits

Create operations are subject to daily rate limits, resetting at 00:00 UTC.

| Resource | Limit |
|----------|-------|
| Collection | 100 requests/day |
| Item | 1,000 requests/day |

## Guides

### Authentication

```typescript
// Step 1: Get a nonce
const { data: { nonce } } = await fortem.auth.getNonce()

// Step 2: Exchange for access token (cached for 5 min)
const { data: { accessToken } } = await fortem.auth.getAccessToken(nonce)
```

After authenticating, all API calls automatically include the token. No manual header management needed.

**Token lifecycle:**
- Tokens are cached internally with a 5 min TTL
- `getValidToken()` auto-refreshes expired tokens
- Minting operations (`collections.create`, `items.create`) consume the token — the SDK clears it automatically and fetches a new one on the next request
- On 403 responses, the SDK retries once with a fresh token

### Users

```typescript
const { data: user } = await fortem.users.verify('0xWalletAddress')
// { isUser, nickname, profileImage, walletAddress }
```

### Collections

**List all collections:**

```typescript
const { data: collections } = await fortem.collections.list()
```

**Create a collection:**

```typescript
const { data: collection } = await fortem.collections.create({
  name: 'My Collection',
  description: 'A new NFT collection',
  link: { website: 'https://example.com' }, // optional
})
```

<details>
<summary>CreateCollectionParams</summary>

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | Collection name |
| `description` | `string` | Yes | Collection description |
| `link` | `{ website?: string }` | No | Collection links |

</details>

### Items

**Get an item:**

```typescript
const { data: item } = await fortem.items.get(collectionId, 'REDEEM-001')
```

**Create an item:**

```typescript
const { data: item } = await fortem.items.create(collectionId, {
  name: 'My Item',
  quantity: 1,
  redeemCode: 'REDEEM-001',
  description: 'A new NFT item',
  recipientAddress: '0x...',
})
```

<details>
<summary>CreateItemParams</summary>

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | Item name |
| `quantity` | `number` | Yes | Quantity to mint |
| `redeemCode` | `string` | Yes | Unique redeem code |
| `description` | `string` | Yes | Item description |
| `recipientAddress` | `string` | Yes | Recipient wallet address |
| `itemImage` | `string` | No | Image URL |
| `attributes` | `{ name, value }[]` | No | Item attributes |
| `redeemUrl` | `string` | No | Redeem URL |

</details>

**Upload an image:**

```typescript
const imageFile = new File([buffer], 'image.png', { type: 'image/png' })
const { data: { itemImage } } = await fortem.items.uploadImage(collectionId, imageFile)
```

### Error Handling

```typescript
import { FortemError, FortemAuthError, FortemTokenExpiredError } from '@fortemlabs/sdk-js'

try {
  await fortem.collections.list()
} catch (error) {
  if (error instanceof FortemAuthError) {
    // 401: Invalid API key or authentication failed
  } else if (error instanceof FortemTokenExpiredError) {
    // 403: Access token expired or consumed
  } else if (error instanceof FortemError) {
    // Other API errors (error.message, error.statusCode, error.code)
  }
}
```

| Error Class | Status | When |
|------------|--------|------|
| `FortemAuthError` | 401 | Invalid API key |
| `FortemTokenExpiredError` | 403 | Token expired or consumed |
| `FortemError` | Other | General API error |

## Configuration

```typescript
const fortem = createFortemClient({
  apiKey: 'your-api-key',           // required
  network: 'testnet',               // 'mainnet' (default) | 'testnet'
  fetch: customFetchFn,             // optional custom fetch
})
```

## License

Business Source License 1.1 — see [LICENSE](./LICENSE) for details.
