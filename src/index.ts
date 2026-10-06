import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  normalizeEntry,
  makeProviderSchema,
  type ApiKeyEntry,
  type VerificationResult,
  parseBulkInput,
  getKeyPreview,
  normalizeProviderName
} from "./providers.js";

const providers = makeProviderSchema();

export async function verifyApiKey(entry: ApiKeyEntry): Promise<VerificationResult> {
  const normalized = normalizeEntry(entry);
  const config = providers[normalized.provider];
  const startedAt = Date.now();

  try {
    const headers = config.headers(normalized);
    const response = await fetch(config.endpoint, {
      method: config.method,
      headers
    });

    let parsedBody: unknown = null;
    const text = await response.text();
    if (text) {
      try {
        parsedBody = JSON.parse(text);
      } catch {
        parsedBody = text;
      }
    }

    const outcome = config.validate(response, parsedBody);

    return {
      provider: normalized.provider,
      valid: outcome.valid,
      status: response.status,
      latency_ms: Date.now() - startedAt,
      message: outcome.message,
      providerLabel: config.label,
      keyPreview: getKeyPreview(normalized),
      details: parsedBody && typeof parsedBody === "object" ? (parsedBody as Record<string, unknown>) : { raw: String(parsedBody ?? "") },
      source: normalized.source
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown verification error.";

    return {
      provider: normalized.provider,
      valid: false,
      status: null,
      latency_ms: Date.now() - startedAt,
      message,
      providerLabel: config.label,
      keyPreview: getKeyPreview(normalized),
      details: { error: message },
      source: normalized.source
    };
  }
}

export async function loadEntriesFromFile(filePath: string): Promise<ApiKeyEntry[]> {
  const resolved = resolve(filePath);
  const content = await readFile(resolved, "utf8");
  return parseBulkInput(content);
}

export function parseSingleEntry(
  provider: string,
  key?: string,
  accountSid?: string,
  authToken?: string
): ApiKeyEntry {
  const normalizedProvider = normalizeProviderName(provider);
  return normalizeEntry({ provider: normalizedProvider, key, accountSid, authToken });
}

export { normalizeProviderName, parseBulkInput, getKeyPreview };
