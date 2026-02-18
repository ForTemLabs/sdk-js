import { vi } from "vitest";
import type { Fetch } from "../fetch";

export function createMockFetch(responses: Array<{ status: number; body: unknown }>) {
  let callIndex = 0;
  return vi.fn<Fetch>(async () => {
    const res = responses[callIndex++];
    return {
      ok: res.status >= 200 && res.status < 300,
      status: res.status,
      json: async () => res.body,
      headers: new Headers(),
    } as Response;
  });
}
