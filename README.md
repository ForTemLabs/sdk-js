# @fortemlabs/sdk-js

ForTem SDK for JavaScript/TypeScript — NFT marketplace API client for the Sui blockchain.

## Installation

```bash
npm install @fortemlabs/sdk-js
# or
pnpm install @fortemlabs/sdk-js
# or
yarn add @fortemlabs/sdk-js
```

## Quick Start

```typescript
import { createFortemClient } from '@fortemlabs/sdk-js'

const fortem = createFortemClient({
  apiKey: 'your-api-key',
  network: 'mainnet', // 'testnet' | 'mainnet' (default: 'mainnet')
})

// 1. Authenticate
const { data: { nonce } } = await fortem.auth.getNonce()
const { data: { accessToken } } = await fortem.auth.getAccessToken(nonce)

// 2. Verify a user
const { data: user } = await fortem.users.verify('0x...')

// 3. List collections
const { data: collections } = await fortem.collections.list()

// 4. Create a collection (consumes token)
const { data: collection } = await fortem.collections.create({
  name: 'My Collection',
  description: 'A new NFT collection',
})

// 5. Create an item (consumes token)
const { data: item } = await fortem.items.create(collection.id, {
  name: 'My Item',
  quantity: 1,
  redeemCode: 'REDEEM-001',
  description: 'A new NFT item',
  recipientAddress: '0x...',
})

// 6. Upload an item image
const imageFile = new File([buffer], 'image.png', { type: 'image/png' })
const { data: { itemImage } } = await fortem.items.uploadImage(collection.id, imageFile)
```

## Rate Limits

Create operations are subject to daily rate limits, resetting at 00:00 UTC.

| Resource | Limit |
|----------|-------|
| Collection | 100 requests/day |
| Item | 1,000 requests/day |

## API Reference

### `createFortemClient(options)`

Creates a new ForTem client instance.

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `apiKey` | `string` | Yes | - | Your ForTem developer API key |
| `network` | `'testnet' \| 'mainnet'` | No | `'mainnet'` | Network environment |
| `fetch` | `typeof fetch` | No | `globalThis.fetch` | Custom fetch function |

---

### Auth (`client.auth`)

#### `getNonce()`

Requests a nonce from the ForTem API for authentication.

```typescript
const { data: { nonce } } = await fortem.auth.getNonce()
```

#### `getAccessToken(nonce)`

Exchanges a nonce for an access token. The token is cached internally (5 min TTL).

```typescript
const { data: { accessToken } } = await fortem.auth.getAccessToken(nonce)
```

#### `getValidToken()`

Returns a valid access token, auto-refreshing if the cached token has expired.

```typescript
const token = await fortem.auth.getValidToken()
```

#### `getToken()`

Returns the cached access token, or `null` if expired or not available.

#### `clearToken()`

Clears the cached access token.

---

### Users (`client.users`)

#### `verify(walletAddress)`

Verify if a wallet address is a registered ForTem user.

```typescript
const { data: user } = await fortem.users.verify('0x...')
// user: { isUser, nickname, profileImage, walletAddress }
```

---

### Collections (`client.collections`)

#### `list()`

List all collections.

```typescript
const { data: collections } = await fortem.collections.list()
// collections: Collection[]
```

#### `create(params)`

Create a new collection. This is a minting operation that consumes the current access token.

```typescript
const { data: collection } = await fortem.collections.create({
  name: 'My Collection',
  description: 'A new NFT collection',
  link: { website: 'https://example.com' }, // optional
})
```

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | Collection name |
| `description` | `string` | Yes | Collection description |
| `link` | `{ website?: string }` | No | Collection links |

---

### Items (`client.items`)

#### `get(collectionId, code)`

Get an item by its redeem code.

```typescript
const { data: item } = await fortem.items.get(42, 'REDEEM-001')
```

#### `create(collectionId, params)`

Create a new item in a collection. This is a minting operation that consumes the current access token.

```typescript
const { data: item } = await fortem.items.create(42, {
  name: 'My Item',
  quantity: 1,
  redeemCode: 'REDEEM-001',
  description: 'A new NFT item',
  recipientAddress: '0x...',
  attributes: [{ name: 'Rarity', value: 'Legendary' }], // optional
  redeemUrl: 'https://example.com/redeem',               // optional
})
```

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

#### `uploadImage(collectionId, file)`

Upload an image for an item. Accepts `Blob` or `File`.

```typescript
const { data: { itemImage } } = await fortem.items.uploadImage(42, imageFile)
// itemImage: uploaded image URL
```

---

### Error Handling

The SDK throws typed errors for different failure scenarios:

```typescript
import {
  FortemError,
  FortemAuthError,
  FortemTokenExpiredError,
} from '@fortemlabs/sdk-js'

try {
  await fortem.collections.list()
} catch (error) {
  if (error instanceof FortemAuthError) {
    // 401: Invalid API key or authentication failed
  } else if (error instanceof FortemTokenExpiredError) {
    // 403: Access token expired or consumed
  } else if (error instanceof FortemError) {
    // Other API errors
    console.error(error.message, error.statusCode, error.code)
  }
}
```

| Error Class | Status | Description |
|------------|--------|-------------|
| `FortemAuthError` | 401 | Invalid API key or authentication failed |
| `FortemTokenExpiredError` | 403 | Access token expired or consumed |
| `FortemError` | Other | General API error |

### Token Management

Minting operations (`collections.create`, `items.create`) consume the access token. The SDK handles this automatically:

1. **Proactive invalidation**: After a successful minting operation, the cached token is cleared automatically.
2. **Auto-retry on 403**: If a request receives a 403 response, the SDK clears the token, fetches a new one, and retries once.

You can also use `getValidToken()` which auto-refreshes expired tokens:

```typescript
// Always returns a valid token - refreshes automatically if needed
const token = await fortem.auth.getValidToken()
```

## License

Business Source License 1.1 — see [LICENSE](./LICENSE) for details.
