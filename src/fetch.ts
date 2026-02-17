import { FortemError, FortemAuthError } from "./errors";
import type { FortemResponse } from "./types";

export type Fetch = typeof globalThis.fetch;

/** Creates a fetch wrapper that automatically injects the API key */
export function createFetchWithApiKey(
  apiKey: string,
  customFetch?: Fetch
): Fetch {
  const fetchFn = customFetch ?? globalThis.fetch;

  return async (input, init) => {
    const headers = new Headers(init?.headers);
    headers.set("x-api-key", apiKey);

    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    return fetchFn(input, { ...init, headers });
  };
}

/** Parses JSON response and handles errors */
export async function parseResponse<T>(
  response: Response
): Promise<FortemResponse<T>> {
  const body = (await response.json()) as Record<string, unknown>;

  if (!response.ok) {
    const message =
      (body.message as string) ??
      (body.error as string) ??
      `Request failed with status ${response.status}`;

    if (response.status === 401) {
      throw new FortemAuthError(message);
    }

    throw new FortemError(message, response.status, body.code as string);
  }

  return body as unknown as FortemResponse<T>;
}
