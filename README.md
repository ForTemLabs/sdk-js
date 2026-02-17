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

// Step 1: Get nonce
const { nonce } = await fortem.auth.getNonce()

// Step 2: Get access token
const { accessToken } = await fortem.auth.getAccessToken(nonce)

// Auto-refresh: get valid token (auto-renews if expired)
const token = await fortem.auth.getValidToken()
```

## API Reference

### `createFortemClient(options)`

Creates a new ForTem client instance.

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `apiKey` | `string` | Yes | - | Your ForTem developer API key |
| `network` | `'testnet' \| 'mainnet'` | No | `'mainnet'` | Network environment |
| `fetch` | `typeof fetch` | No | `globalThis.fetch` | Custom fetch function |

### `client.auth.getNonce()`

Requests a nonce from the ForTem API for authentication.

### `client.auth.getAccessToken(nonce)`

Exchanges a nonce for an access token. The token is cached internally (5 min TTL).

### `client.auth.getValidToken()`

Returns a valid access token, auto-refreshing if the cached token has expired.

### `client.auth.getToken()`

Returns the cached access token, or `null` if expired or not available.

### `client.auth.clearToken()`

Clears the cached access token.

## License

Business Source License 1.1 — see [LICENSE](./LICENSE) for details.
