#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import { readFile } from "node:fs/promises";
import { verifyApiKey } from "./index.js";
import { normalizeProviderName } from "./providers.js";

const program = new Command();
program
  .name("verify-key")
  .description("Validate and test API keys against real provider endpoints.")
  .version("1.1.0");

program
  .option("-p, --provider <provider>", "API provider name (openai, anthropic, github, stripe, twilio, openrouter, plus many more)")
  .option("-k, --key <key>", "Raw API key or token to validate")
  .option("--account-sid <accountSid>", "Twilio account SID")
  .option("--auth-token <authToken>", "Twilio auth token")
  .option("-f, --file <path>", "Path to a JSON bulk input file")
  .option("--format <format>", "Output format: json or text", "text");

program.parse(process.argv);
const options = program.opts();

async function main() {
  const entries: Array<{ provider: string; key?: string; accountSid?: string; authToken?: string; source?: string }> = [];

  if (options.file) {
    const raw = await readFile(options.file, "utf8");
    const parsed = JSON.parse(raw) as unknown;

    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        if (item && typeof item === "object") {
          const candidate = item as Record<string, unknown>;
          if (typeof candidate.provider === "string") {
            entries.push({
              provider: candidate.provider,
              key: typeof candidate.key === "string" ? candidate.key : undefined,
              accountSid: typeof candidate.accountSid === "string" ? candidate.accountSid : undefined,
              authToken: typeof candidate.authToken === "string" ? candidate.authToken : undefined,
              source: options.file
            });
          }
        }
      }
    } else if (parsed && typeof parsed === "object" && Array.isArray((parsed as { keys?: unknown[] }).keys)) {
      for (const item of (parsed as { keys: Array<Record<string, unknown>> }).keys) {
        entries.push({
          provider: String(item.provider ?? ""),
          key: typeof item.key === "string" ? item.key : undefined,
          accountSid: typeof item.accountSid === "string" ? item.accountSid : undefined,
          authToken: typeof item.authToken === "string" ? item.authToken : undefined,
          source: options.file
        });
      }
    } else {
      throw new Error("Bulk file format is not supported. Use a JSON array or { keys: [...] }.");
    }
  }

  if (options.provider && options.key) {
    entries.push({
      provider: options.provider,
      key: options.key,
      accountSid: options.accountSid,
      authToken: options.authToken,
      source: "cli"
    });
  }

  if (entries.length === 0) {
    throw new Error("No input provided. Use --provider and --key, or --file for bulk validation.");
  }

  const results = await Promise.all(
    entries.map((entry) => {
      const provider = normalizeProviderName(entry.provider || "");
      return verifyApiKey({
        provider,
        key: entry.key,
        accountSid: entry.accountSid,
        authToken: entry.authToken,
        source: entry.source
      });
    })
  );

  if (options.format === "json") {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  for (const result of results) {
    const label = result.valid ? chalk.green("VALID") : chalk.red("INVALID");
    console.log(
      `${label} | ${result.providerLabel} | ${result.keyPreview} | status=${result.status ?? "ERR"} | ${result.message}`
    );
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(chalk.red(`Error: ${message}`));
  process.exit(1);
});
