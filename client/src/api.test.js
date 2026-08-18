import { apiUrl, hasValidToken } from "./api";
import { expect, test } from "vitest";

function tokenWithExpiry(exp) {
  return `header.${btoa(JSON.stringify({ exp }))}.signature`;
}

test("apiUrl builds relative API paths when no backend URL is configured", () => {
  expect(apiUrl("/api/health")).toMatch(/\/api\/health$/);
});

test("hasValidToken checks token expiry", () => {
  expect(hasValidToken(tokenWithExpiry(Math.floor(Date.now() / 1000) + 60))).toBe(true);
  expect(hasValidToken(tokenWithExpiry(Math.floor(Date.now() / 1000) - 60))).toBe(false);
  expect(hasValidToken("invalid")).toBe(false);
});
