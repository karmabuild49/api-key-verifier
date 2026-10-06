# API Key Verifier

A professional CLI tool for validating and testing API keys against real provider endpoints. Supports 50+ API providers including OpenAI, GitHub, Stripe, Anthropic, and many more.

## Features

✅ **50+ Provider Support** - OpenAI, Anthropic, GitHub, Stripe, Twilio, OpenRouter, Cohere, Hugging Face, AWS, Azure, Google Cloud, Together AI, Replicate, Perplexity, Mistral, Groq, DeepSeek, NVIDIA, Pinecone, Supabase, Firebase, MongoDB, PostgreSQL, Slack, Discord, SendGrid, Mailgun, Datadog, Sentry, New Relic, Cloudflare, DigitalOcean, Vultr, Linode, Heroku, Netlify, Vercel, Railway, Render, Auth0, Okta, Shopify, PayPal, Square, Notion, Airtable, HubSpot, Salesforce, Jira, Bitbucket, GitLab, Gitea, HashiCorp, Terraform, Ansible, and more.

✅ **Single Key Validation** - Test individual API keys instantly

✅ **Bulk Verification** - Validate multiple keys from JSON files

✅ **Live Testing** - Makes real requests to provider endpoints to verify authenticity

✅ **Safe Key Preview** - Displays truncated keys (sk...abcd) to keep secrets protected

✅ **Performance Metrics** - Shows latency in milliseconds for each verification

✅ **Flexible Output** - Text or JSON format for scripting and automation

✅ **TypeScript** - Fully typed, extensible codebase

## Installation

### From GitHub

```bash
git clone https://github.com/karmabuild49/api-key-verifier.git
cd api-key-verifier
npm install
npm run build
```

### Global Usage

After building, you can run the CLI:

```bash
node dist/cli.js --help
```

Or set it as a global bin:

```bash
npm link
verify-key --help
```

## Quick Start

### Verify a Single API Key

**OpenAI:**
```bash
node dist/cli.js --provider openai --key sk_your_key_here
```

**GitHub:**
```bash
node dist/cli.js --provider github --key ghp_your_token_here
```

**Stripe:**
```bash
node dist/cli.js --provider stripe --key sk_live_your_key_here
```

**Anthropic:**
```bash
node dist/cli.js --provider anthropic --key sk-ant-your_key_here
```

### Verify Multiple Keys from a File

Create `keys.json`:

```json
{
  "keys": [
    { "provider": "openai", "key": "sk-..." },
    { "provider": "github", "key": "ghp_..." },
    { "provider": "stripe", "key": "sk_live_..." },
    { "provider": "anthropic", "key": "sk-ant-..." },
    { "provider": "discord", "token": "YOUR_BOT_TOKEN" }
  ]
}
```

Then run:

```bash
node dist/cli.js --file keys.json
```

### JSON Output (for scripting)

```bash
node dist/cli.js --file keys.json --format json
```

Output:
```json
[
  {
    "provider": "openai",
    "valid": true,
    "status": 200,
    "latency_ms": 342,
    "message": "OpenAI key is valid and active.",
    "providerLabel": "OpenAI",
    "keyPreview": "sk...abcd"
  },
  {
    "provider": "github",
    "valid": false,
    "status": 401,
    "latency_ms": 156,
    "message": "GitHub token is invalid or lacks permissions.",
    "providerLabel": "GitHub",
    "keyPreview": "ghp...xyz"
  }
]
```

## Supported Providers

### AI/LLM Providers
- OpenAI (openai, oa, gpt)
- Anthropic (anthropic, claude)
- Cohere (cohere)
- Hugging Face (huggingface, hf)
- Together AI (together)
- Replicate (replicate)
- Perplexity (perplexity)
- Mistral (mistral)
- Groq (groq)
- DeepSeek (deepseek)
- OpenRouter (openrouter, or)
- NVIDIA (nvidia)
- Ollama (ollama)

### Cloud Platforms
- AWS (aws, amazon)
- Azure (azure, ms)
- Google Cloud (google, gcp)
- DigitalOcean (digitalocean, do)
- Vultr (vultr)
- Linode (linode)

### Infrastructure & Deployment
- Heroku (heroku)
- Netlify (netlify)
- Vercel (vercel)
- Railway (railway)
- Render (render)
- Cloudflare (cloudflare, cf)

### Databases & Vector
- PostgreSQL (postgres, pg)
- MongoDB (mongodb)
- Supabase (supabase)
- Firebase (firebase)
- Pinecone (pinecone)
- pgVector (pgvector)

### Communication
- Slack (slack)
- Discord (discord)
- SendGrid (sendgrid)
- Mailgun (mailgun)
- Twilio (twilio)

### Monitoring & Analytics
- Datadog (datadog)
- Sentry (sentry)
- New Relic (newrelic, nr)

### Payment & Commerce
- Stripe (stripe)
- Square (square)
- PayPal (paypal)
- Shopify (shopify)

### Productivity & Collaboration
- Notion (notion)
- Airtable (airtable)
- HubSpot (hubspot)
- Salesforce (salesforce)
- Jira (jira)

### Version Control
- GitHub (github, gh)
- GitLab (gitlab)
- Bitbucket (bitbucket)
- Gitea (gitea)

### Authentication & Identity
- Auth0 (auth0)
- Okta (okta)

### Infrastructure as Code
- HashiCorp (hashicorp)
- Terraform (terraform)
- Ansible (ansible)

## Command Options

```
Usage: verify-key [options]

Options:
  -V, --version                      output the version number
  -p, --provider <provider>          API provider name
  -k, --key <key>                    API key or token to validate
  --account-sid <accountSid>         Twilio account SID
  --auth-token <authToken>           Twilio auth token
  -f, --file <path>                  Path to a JSON bulk input file
  --format <format>                  Output format: json or text (default: "text")
  -h, --help                         display help for command
```

## Usage Examples

### Text Output (Default)

```bash
$ node dist/cli.js --provider openai --key sk_test
VALID | OpenAI | sk...test | status=200 | OpenAI key is valid and active.
```

### JSON Output

```bash
$ node dist/cli.js --provider github --key ghp_test --format json
[
  {
    "provider": "github",
    "valid": true,
    "status": 200,
    "latency_ms": 245,
    "message": "GitHub token is valid.",
    "providerLabel": "GitHub",
    "keyPreview": "ghp...test"
  }
]
```

### Bulk Validation with CSV-style Input

Create `keys.txt`:
```
openai sk_test_key_1
github ghp_test_token_2
stripe sk_live_test_key_3
```

```bash
node dist/cli.js --file keys.txt --format json
```

## Development

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

### Development Mode (Build & Run)

```bash
npm run dev -- --provider github --key test_token
```

## Project Structure

```
api-key-verifier/
├── src/
│   ├── cli.ts           # CLI entrypoint
│   ├── index.ts         # Core verification logic
│   ├── providers.ts     # 50+ provider configurations
│   └── test.ts          # Unit tests
├── dist/                # Compiled JavaScript (generated)
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── README.md            # This file
```

## How It Works

1. **Parse Input** - Accepts single keys via CLI flags or bulk input from JSON files
2. **Normalize** - Converts provider aliases (e.g., "gh" → "github") to standard names
3. **Validate** - Makes a lightweight authentication request to the provider's API
4. **Report** - Returns whether the key is valid with status code, latency, and error details

## Security Notes

⚠️ **Never share raw API keys in logs or version control**

- Keys are previewed as `sk...abcd` to keep secrets safe
- Always use environment variables or secure vaults for real keys
- This tool makes real requests to provider APIs; ensure your keys are correct

## Example Workflows

### CI/CD Integration

```bash
# Validate keys before deployment
node dist/cli.js --file .env.keys.json --format json > validation.json

# Check if all keys are valid
jq 'all(.valid == true)' validation.json
```

### Automated Monitoring

```bash
# Run hourly to check if keys are still valid
*/60 * * * * /path/to/api-key-verifier/dist/cli.js --file /secure/keys.json --format json >> /logs/key-validation.json
```

### Development Tooling

```bash
# Quickly verify your test keys
npm run build && node dist/cli.js --provider openai --key $OPENAI_API_KEY
```

## License

MIT

## Contributing

Contributions welcome! Please feel free to open issues or pull requests.

## Support

For issues, feature requests, or questions, visit:
https://github.com/karmabuild49/api-key-verifier/issues
