import test from "node:test";
import assert from "node:assert/strict";
import { normalizeProviderName, parseBulkInput } from "./providers.js";

test("normalizeProviderName resolves aliases", () => {
  assert.equal(normalizeProviderName("openai"), "openai");
  assert.equal(normalizeProviderName("gh"), "github");
  assert.equal(normalizeProviderName("claude"), "anthropic");
});

test("parseBulkInput supports JSON arrays", () => {
  const entries = parseBulkInput(JSON.stringify([
    { provider: "openai", key: "sk-test-123" },
    { provider: "github", key: "ghp_test_456" }
  ]));

  assert.equal(entries.length, 2);
  assert.equal(entries[0].provider, "openai");
  assert.equal(entries[1].provider, "github");
});
