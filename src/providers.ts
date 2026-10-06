export type ProviderName =
  | "openai"
  | "anthropic"
  | "github"
  | "stripe"
  | "twilio"
  | "openrouter"
  | "cohere"
  | "huggingface"
  | "aws"
  | "azure"
  | "google"
  | "together"
  | "replicate"
  | "perplexity"
  | "mistral"
  | "groq"
  | "deepseek"
  | "ollama"
  | "nvidia"
  | "pgvector"
  | "pinecone"
  | "supabase"
  | "firebase"
  | "mongodb"
  | "postgres"
  | "slack"
  | "discord"
  | "sendgrid"
  | "mailgun"
  | "datadog"
  | "sentry"
  | "newrelic"
  | "cloudflare"
  | "digitalocean"
  | "vultr"
  | "linode"
  | "heroku"
  | "netlify"
  | "vercel"
  | "railway"
  | "render"
  | "auth0"
  | "okta"
  | "shopify"
  | "paypal"
  | "square"
  | "notion"
  | "airtable"
  | "hubspot"
  | "salesforce"
  | "jira"
  | "bitbucket"
  | "gitlab"
  | "gitea"
  | "hashicorp"
  | "terraform"
  | "ansible";

export interface ApiKeyEntry {
  provider: ProviderName;
  key?: string;
  secret?: string;
  token?: string;
  accountSid?: string;
  authToken?: string;
  apiId?: string;
  apiSecret?: string;
  accessKey?: string;
  secretKey?: string;
  username?: string;
  password?: string;
  notes?: string;
  source?: string;
}

export interface VerificationResult {
  provider: ProviderName;
  valid: boolean;
  status: number | null;
  latency_ms: number;
  message: string;
  providerLabel: string;
  keyPreview: string;
  details?: Record<string, unknown>;
  source?: string;
}

export interface ProviderSchema {
  label: string;
  endpoint: string;
  method: "GET" | "POST";
  headers: (entry: ApiKeyEntry) => Record<string, string>;
  validate: (response: Response, body: unknown) => { valid: boolean; message: string };
}

export const PROVIDER_ALIASES: Record<string, ProviderName> = {
  openai: "openai",
  oa: "openai",
  gpt: "openai",
  anthropic: "anthropic",
  claude: "anthropic",
  github: "github",
  gh: "github",
  stripe: "stripe",
  twilio: "twilio",
  openrouter: "openrouter",
  or: "openrouter",
  cohere: "cohere",
  huggingface: "huggingface",
  hf: "huggingface",
  aws: "aws",
  amazon: "aws",
  azure: "azure",
  ms: "azure",
  google: "google",
  gcp: "google",
  together: "together",
  replicate: "replicate",
  perplexity: "perplexity",
  mistral: "mistral",
  groq: "groq",
  deepseek: "deepseek",
  ollama: "ollama",
  nvidia: "nvidia",
  pgvector: "pgvector",
  pinecone: "pinecone",
  supabase: "supabase",
  firebase: "firebase",
  mongodb: "mongodb",
  postgres: "postgres",
  pg: "postgres",
  slack: "slack",
  discord: "discord",
  sendgrid: "sendgrid",
  mailgun: "mailgun",
  datadog: "datadog",
  sentry: "sentry",
  newrelic: "newrelic",
  nr: "newrelic",
  cloudflare: "cloudflare",
  cf: "cloudflare",
  digitalocean: "digitalocean",
  do: "digitalocean",
  vultr: "vultr",
  linode: "linode",
  heroku: "heroku",
  netlify: "netlify",
  vercel: "vercel",
  railway: "railway",
  render: "render",
  auth0: "auth0",
  okta: "okta",
  shopify: "shopify",
  paypal: "paypal",
  square: "square",
  notion: "notion",
  airtable: "airtable",
  hubspot: "hubspot",
  salesforce: "salesforce",
  jira: "jira",
  bitbucket: "bitbucket",
  gitlab: "gitlab",
  gitea: "gitea",
  hashicorp: "hashicorp",
  terraform: "terraform",
  ansible: "ansible"
};

function previewKey(value?: string): string {
  if (!value) return "(missing)";
  if (value.length <= 10) return value;
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

export function normalizeProviderName(input: string): ProviderName {
  const key = input.trim().toLowerCase();
  const resolved = PROVIDER_ALIASES[key];
  if (resolved) return resolved;
  throw new Error(`Unsupported provider: ${input}`);
}

export function normalizeEntry(input: Partial<ApiKeyEntry>): ApiKeyEntry {
  const provider = normalizeProviderName(input.provider ?? "");

  const key = input.key?.trim() || undefined;
  const secret = input.secret?.trim() || undefined;
  const token = input.token?.trim() || undefined;
  const accountSid = input.accountSid?.trim() || undefined;
  const authToken = input.authToken?.trim() || undefined;
  const apiId = input.apiId?.trim() || undefined;
  const apiSecret = input.apiSecret?.trim() || undefined;
  const accessKey = input.accessKey?.trim() || undefined;
  const secretKey = input.secretKey?.trim() || undefined;
  const username = input.username?.trim() || undefined;
  const password = input.password?.trim() || undefined;

  const hasCredentials = key || secret || token || accountSid || authToken || apiId || apiSecret || accessKey || secretKey || username || password;

  if (!hasCredentials) {
    throw new Error(`Missing credentials for provider '${provider}'.`);
  }

  return {
    provider,
    key,
    secret,
    token,
    accountSid,
    authToken,
    apiId,
    apiSecret,
    accessKey,
    secretKey,
    username,
    password,
    notes: input.notes?.trim(),
    source: input.source
  };
}

export function makeProviderSchema(): Record<ProviderName, ProviderSchema> {
  return {
    openai: {
      label: "OpenAI",
      endpoint: "https://api.openai.com/v1/models",
      method: "GET",
      headers: (entry) => ({ Authorization: `Bearer ${String(entry.key ?? "")}` }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "OpenAI key is valid and active." };
        if (response.status === 401 || response.status === 403) return { valid: false, message: "OpenAI rejected the API key." };
        return { valid: false, message: `OpenAI request failed with status ${response.status}.` };
      }
    },
    anthropic: {
      label: "Anthropic",
      endpoint: "https://api.anthropic.com/v1/models",
      method: "GET",
      headers: (entry) => ({ "x-api-key": String(entry.key ?? ""), "anthropic-version": "2023-06-01" }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "Anthropic key is valid." };
        if (response.status === 401 || response.status === 403) return { valid: false, message: "Anthropic rejected the API key." };
        return { valid: false, message: `Anthropic request failed with status ${response.status}.` };
      }
    },
    github: {
      label: "GitHub",
      endpoint: "https://api.github.com/user",
      method: "GET",
      headers: (entry) => ({ Authorization: `Bearer ${String(entry.key ?? "")}`, "User-Agent": "api-key-verifier/1.1.0" }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "GitHub token is valid." };
        if (response.status === 401 || response.status === 403) return { valid: false, message: "GitHub token is invalid or lacks permissions." };
        return { valid: false, message: `GitHub request failed with status ${response.status}.` };
      }
    },
    stripe: {
      label: "Stripe",
      endpoint: "https://api.stripe.com/v1/account",
      method: "GET",
      headers: (entry) => ({ Authorization: `Bearer ${String(entry.key ?? "")}` }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "Stripe API key is valid." };
        if (response.status === 401 || response.status === 403) return { valid: false, message: "Stripe rejected the API key." };
        return { valid: false, message: `Stripe request failed with status ${response.status}.` };
      }
    },
    twilio: {
      label: "Twilio",
      endpoint: "https://api.twilio.com/2010-04-01/Accounts.json",
      method: "GET",
      headers: (entry) => {
        const sid = entry.accountSid || "";
        const token = entry.authToken || "";
        const encoded = Buffer.from(`${sid}:${token}`).toString("base64");
        return { Authorization: `Basic ${encoded}` };
      },
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "Twilio credentials are valid." };
        if (response.status === 401 || response.status === 403) return { valid: false, message: "Twilio credentials are invalid." };
        return { valid: false, message: `Twilio request failed with status ${response.status}.` };
      }
    },
    openrouter: {
      label: "OpenRouter",
      endpoint: "https://openrouter.ai/api/v1/models",
      method: "GET",
      headers: (entry) => ({ Authorization: `Bearer ${String(entry.key ?? "")}` }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "OpenRouter API key is valid." };
        if (response.status === 401 || response.status === 403) return { valid: false, message: "OpenRouter rejected the API key." };
        return { valid: false, message: `OpenRouter request failed with status ${response.status}.` };
      }
    },
    cohere: {
      label: "Cohere",
      endpoint: "https://api.cohere.com/v1/models",
      method: "GET",
      headers: (entry) => ({ Authorization: `Bearer ${String(entry.key ?? "")}` }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "Cohere API key is valid." };
        return { valid: false, message: `Cohere request failed with status ${response.status}.` };
      }
    },
    huggingface: {
      label: "Hugging Face",
      endpoint: "https://huggingface.co/api/whoami",
      method: "GET",
      headers: (entry) => ({ Authorization: `Bearer ${String(entry.key ?? "")}` }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "Hugging Face token is valid." };
        return { valid: false, message: `Hugging Face request failed with status ${response.status}.` };
      }
    },
    aws: {
      label: "AWS",
      endpoint: "https://sts.amazonaws.com/?Action=GetCallerIdentity&Version=2011-06-15",
      method: "GET",
      headers: (entry) => ({ Authorization: `AWS4-HMAC-SHA256 Credential=${String(entry.accessKey ?? "")}` }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "AWS credentials are valid." };
        return { valid: false, message: `AWS request failed with status ${response.status}.` };
      }
    },
    azure: {
      label: "Azure",
      endpoint: "https://management.azure.com/subscriptions?api-version=2021-04-01",
      method: "GET",
      headers: (entry) => ({ Authorization: `Bearer ${String(entry.token ?? "")}` }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "Azure token is valid." };
        return { valid: false, message: `Azure request failed with status ${response.status}.` };
      }
    },
    google: {
      label: "Google Cloud",
      endpoint: "https://www.googleapis.com/oauth2/v1/tokeninfo",
      method: "GET",
      headers: (entry) => ({ Authorization: `Bearer ${String(entry.token ?? "")}` }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "Google Cloud token is valid." };
        return { valid: false, message: `Google Cloud request failed with status ${response.status}.` };
      }
    },
    together: {
      label: "Together AI",
      endpoint: "https://api.together.xyz/v1/models",
      method: "GET",
      headers: (entry) => ({ Authorization: `Bearer ${String(entry.key ?? "")}` }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "Together AI key is valid." };
        return { valid: false, message: `Together AI request failed with status ${response.status}.` };
      }
    },
    replicate: {
      label: "Replicate",
      endpoint: "https://api.replicate.com/v1/account",
      method: "GET",
      headers: (entry) => ({ Authorization: `Bearer ${String(entry.key ?? "")}` }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "Replicate API key is valid." };
        return { valid: false, message: `Replicate request failed with status ${response.status}.` };
      }
    },
    perplexity: {
      label: "Perplexity",
      endpoint: "https://api.perplexity.ai/models",
      method: "GET",
      headers: (entry) => ({ Authorization: `Bearer ${String(entry.key ?? "")}` }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "Perplexity API key is valid." };
        return { valid: false, message: `Perplexity request failed with status ${response.status}.` };
      }
    },
    mistral: {
      label: "Mistral",
      endpoint: "https://api.mistral.ai/v1/models",
      method: "GET",
      headers: (entry) => ({ Authorization: `Bearer ${String(entry.key ?? "")}` }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "Mistral API key is valid." };
        return { valid: false, message: `Mistral request failed with status ${response.status}.` };
      }
    },
    groq: {
      label: "Groq",
      endpoint: "https://api.groq.com/openai/v1/models",
      method: "GET",
      headers: (entry) => ({ Authorization: `Bearer ${String(entry.key ?? "")}` }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "Groq API key is valid." };
        return { valid: false, message: `Groq request failed with status ${response.status}.` };
      }
    },
    deepseek: {
      label: "DeepSeek",
      endpoint: "https://api.deepseek.com/v1/models",
      method: "GET",
      headers: (entry) => ({ Authorization: `Bearer ${String(entry.key ?? "")}` }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "DeepSeek API key is valid." };
        return { valid: false, message: `DeepSeek request failed with status ${response.status}.` };
      }
    },
    ollama: {
      label: "Ollama",
      endpoint: "http://localhost:11434/api/tags",
      method: "GET",
      headers: () => ({}),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "Ollama instance is accessible." };
        return { valid: false, message: `Ollama request failed with status ${response.status}.` };
      }
    },
    nvidia: {
      label: "NVIDIA",
      endpoint: "https://api.nvcf.nvidia.com/v2/nvcf/functions",
      method: "GET",
      headers: (entry) => ({ Authorization: `Bearer ${String(entry.key ?? "")}` }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "NVIDIA API key is valid." };
        return { valid: false, message: `NVIDIA request failed with status ${response.status}.` };
      }
    },
    pgvector: {
      label: "pgVector",
      endpoint: "https://api.pgvector.dev/status",
      method: "GET",
      headers: (entry) => ({ Authorization: `Bearer ${String(entry.key ?? "")}` }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "pgVector API key is valid." };
        return { valid: false, message: `pgVector request failed with status ${response.status}.` };
      }
    },
    pinecone: {
      label: "Pinecone",
      endpoint: "https://api.pinecone.io/indexes",
      method: "GET",
      headers: (entry) => ({ "Api-Key": String(entry.key ?? "") }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "Pinecone API key is valid." };
        return { valid: false, message: `Pinecone request failed with status ${response.status}.` };
      }
    },
    supabase: {
      label: "Supabase",
      endpoint: "https://api.supabase.com/v1/projects",
      method: "GET",
      headers: (entry) => ({ Authorization: `Bearer ${String(entry.key ?? "")}` }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "Supabase API key is valid." };
        return { valid: false, message: `Supabase request failed with status ${response.status}.` };
      }
    },
    firebase: {
      label: "Firebase",
      endpoint: "https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=",
      method: "POST",
      headers: () => ({ "Content-Type": "application/json" }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "Firebase key is valid." };
        return { valid: false, message: `Firebase request failed with status ${response.status}.` };
      }
    },
    mongodb: {
      label: "MongoDB",
      endpoint: "https://cloud.mongodb.com/api/admin/v3.0/auth/providers/",
      method: "GET",
      headers: (entry) => ({ Authorization: `Digest ${String(entry.username ?? "")}:${String(entry.password ?? "")}` }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "MongoDB credentials are valid." };
        return { valid: false, message: `MongoDB request failed with status ${response.status}.` };
      }
    },
    postgres: {
      label: "PostgreSQL",
      endpoint: "https://api.postgres.app/health",
      method: "GET",
      headers: (entry) => ({ "X-API-Key": String(entry.key ?? "") }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "PostgreSQL connection is valid." };
        return { valid: false, message: `PostgreSQL request failed with status ${response.status}.` };
      }
    },
    slack: {
      label: "Slack",
      endpoint: "https://slack.com/api/auth.test",
      method: "POST",
      headers: (entry) => ({ Authorization: `Bearer ${String(entry.token ?? "")}` }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "Slack token is valid." };
        return { valid: false, message: `Slack request failed with status ${response.status}.` };
      }
    },
    discord: {
      label: "Discord",
      endpoint: "https://discord.com/api/v10/users/@me",
      method: "GET",
      headers: (entry) => ({ Authorization: `Bot ${String(entry.token ?? "")}` }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "Discord token is valid." };
        return { valid: false, message: `Discord request failed with status ${response.status}.` };
      }
    },
    sendgrid: {
      label: "SendGrid",
      endpoint: "https://api.sendgrid.com/v3/user/account",
      method: "GET",
      headers: (entry) => ({ Authorization: `Bearer ${String(entry.key ?? "")}` }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "SendGrid API key is valid." };
        return { valid: false, message: `SendGrid request failed with status ${response.status}.` };
      }
    },
    mailgun: {
      label: "Mailgun",
      endpoint: "https://api.mailgun.net/v3/",
      method: "GET",
      headers: (entry) => {
        const auth = Buffer.from(`api:${String(entry.key ?? "")}`).toString("base64");
        return { Authorization: `Basic ${auth}` };
      },
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "Mailgun API key is valid." };
        return { valid: false, message: `Mailgun request failed with status ${response.status}.` };
      }
    },
    datadog: {
      label: "Datadog",
      endpoint: "https://api.datadoghq.com/api/v1/validate",
      method: "GET",
      headers: (entry) => ({ "DD-API-KEY": String(entry.key ?? ""), "DD-APPLICATION-KEY": String(entry.token ?? "") }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "Datadog API key is valid." };
        return { valid: false, message: `Datadog request failed with status ${response.status}.` };
      }
    },
    sentry: {
      label: "Sentry",
      endpoint: "https://sentry.io/api/0/organizations/",
      method: "GET",
      headers: (entry) => ({ Authorization: `Bearer ${String(entry.token ?? "")}` }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "Sentry token is valid." };
        return { valid: false, message: `Sentry request failed with status ${response.status}.` };
      }
    },
    newrelic: {
      label: "New Relic",
      endpoint: "https://api.newrelic.com/v2/users.json",
      method: "GET",
      headers: (entry) => ({ "X-Api-Key": String(entry.key ?? "") }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "New Relic API key is valid." };
        return { valid: false, message: `New Relic request failed with status ${response.status}.` };
      }
    },
    cloudflare: {
      label: "Cloudflare",
      endpoint: "https://api.cloudflare.com/client/v4/user",
      method: "GET",
      headers: (entry) => ({ Authorization: `Bearer ${String(entry.token ?? "")}` }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "Cloudflare token is valid." };
        return { valid: false, message: `Cloudflare request failed with status ${response.status}.` };
      }
    },
    digitalocean: {
      label: "DigitalOcean",
      endpoint: "https://api.digitalocean.com/v2/account",
      method: "GET",
      headers: (entry) => ({ Authorization: `Bearer ${String(entry.token ?? "")}` }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "DigitalOcean token is valid." };
        return { valid: false, message: `DigitalOcean request failed with status ${response.status}.` };
      }
    },
    vultr: {
      label: "Vultr",
      endpoint: "https://api.vultr.com/v2/account",
      method: "GET",
      headers: (entry) => ({ Authorization: `Bearer ${String(entry.token ?? "")}` }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "Vultr API key is valid." };
        return { valid: false, message: `Vultr request failed with status ${response.status}.` };
      }
    },
    linode: {
      label: "Linode",
      endpoint: "https://api.linode.com/v4/account",
      method: "GET",
      headers: (entry) => ({ Authorization: `Bearer ${String(entry.token ?? "")}` }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "Linode API token is valid." };
        return { valid: false, message: `Linode request failed with status ${response.status}.` };
      }
    },
    heroku: {
      label: "Heroku",
      endpoint: "https://api.heroku.com/apps",
      method: "GET",
      headers: (entry) => ({ Authorization: `Bearer ${String(entry.token ?? "")}`, Accept: "application/vnd.heroku+json; version=3" }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "Heroku API token is valid." };
        return { valid: false, message: `Heroku request failed with status ${response.status}.` };
      }
    },
    netlify: {
      label: "Netlify",
      endpoint: "https://api.netlify.com/api/v1/user",
      method: "GET",
      headers: (entry) => ({ Authorization: `Bearer ${String(entry.token ?? "")}` }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "Netlify API token is valid." };
        return { valid: false, message: `Netlify request failed with status ${response.status}.` };
      }
    },
    vercel: {
      label: "Vercel",
      endpoint: "https://api.vercel.com/v3/user",
      method: "GET",
      headers: (entry) => ({ Authorization: `Bearer ${String(entry.token ?? "")}` }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "Vercel API token is valid." };
        return { valid: false, message: `Vercel request failed with status ${response.status}.` };
      }
    },
    railway: {
      label: "Railway",
      endpoint: "https://backboard.railway.app/graphql",
      method: "POST",
      headers: (entry) => ({ Authorization: `Bearer ${String(entry.token ?? "")}` }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "Railway API token is valid." };
        return { valid: false, message: `Railway request failed with status ${response.status}.` };
      }
    },
    render: {
      label: "Render",
      endpoint: "https://api.render.com/v1/owners",
      method: "GET",
      headers: (entry) => ({ Authorization: `Bearer ${String(entry.token ?? "")}` }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "Render API token is valid." };
        return { valid: false, message: `Render request failed with status ${response.status}.` };
      }
    },
    auth0: {
      label: "Auth0",
      endpoint: "https://example.auth0.com/api/v2/users",
      method: "GET",
      headers: (entry) => ({ Authorization: `Bearer ${String(entry.token ?? "")}` }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "Auth0 token is valid." };
        return { valid: false, message: `Auth0 request failed with status ${response.status}.` };
      }
    },
    okta: {
      label: "Okta",
      endpoint: "https://example.okta.com/api/v1/users",
      method: "GET",
      headers: (entry) => ({ Authorization: `Bearer ${String(entry.token ?? "")}` }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "Okta token is valid." };
        return { valid: false, message: `Okta request failed with status ${response.status}.` };
      }
    },
    shopify: {
      label: "Shopify",
      endpoint: "https://example.myshopify.com/admin/api/2024-01/graphql.json",
      method: "POST",
      headers: (entry) => ({ "X-Shopify-Access-Token": String(entry.token ?? "") }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "Shopify access token is valid." };
        return { valid: false, message: `Shopify request failed with status ${response.status}.` };
      }
    },
    paypal: {
      label: "PayPal",
      endpoint: "https://api.paypal.com/v1/oauth2/token",
      method: "POST",
      headers: () => ({ "Content-Type": "application/x-www-form-urlencoded" }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "PayPal credentials are valid." };
        return { valid: false, message: `PayPal request failed with status ${response.status}.` };
      }
    },
    square: {
      label: "Square",
      endpoint: "https://connect.squareup.com/v2/me",
      method: "GET",
      headers: (entry) => ({ Authorization: `Bearer ${String(entry.token ?? "")}` }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "Square API token is valid." };
        return { valid: false, message: `Square request failed with status ${response.status}.` };
      }
    },
    notion: {
      label: "Notion",
      endpoint: "https://api.notion.com/v1/users",
      method: "GET",
      headers: (entry) => ({ Authorization: `Bearer ${String(entry.token ?? "")}`, "Notion-Version": "2022-06-28" }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "Notion API token is valid." };
        return { valid: false, message: `Notion request failed with status ${response.status}.` };
      }
    },
    airtable: {
      label: "Airtable",
      endpoint: "https://api.airtable.com/v0/meta/bases",
      method: "GET",
      headers: (entry) => ({ Authorization: `Bearer ${String(entry.token ?? "")}` }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "Airtable API token is valid." };
        return { valid: false, message: `Airtable request failed with status ${response.status}.` };
      }
    },
    hubspot: {
      label: "HubSpot",
      endpoint: "https://api.hubapi.com/crm/v3/objects/contacts",
      method: "GET",
      headers: (entry) => ({ Authorization: `Bearer ${String(entry.token ?? "")}` }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "HubSpot API token is valid." };
        return { valid: false, message: `HubSpot request failed with status ${response.status}.` };
      }
    },
    salesforce: {
      label: "Salesforce",
      endpoint: "https://example.salesforce.com/services/oauth2/revoke",
      method: "POST",
      headers: (entry) => ({ Authorization: `Bearer ${String(entry.token ?? "")}` }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "Salesforce token is valid." };
        return { valid: false, message: `Salesforce request failed with status ${response.status}.` };
      }
    },
    jira: {
      label: "Jira",
      endpoint: "https://example.atlassian.net/rest/api/3/user",
      method: "GET",
      headers: (entry) => ({ Authorization: `Bearer ${String(entry.token ?? "")}` }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "Jira API token is valid." };
        return { valid: false, message: `Jira request failed with status ${response.status}.` };
      }
    },
    bitbucket: {
      label: "Bitbucket",
      endpoint: "https://api.bitbucket.org/2.0/user",
      method: "GET",
      headers: (entry) => ({ Authorization: `Bearer ${String(entry.token ?? "")}` }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "Bitbucket token is valid." };
        return { valid: false, message: `Bitbucket request failed with status ${response.status}.` };
      }
    },
    gitlab: {
      label: "GitLab",
      endpoint: "https://gitlab.com/api/v4/user",
      method: "GET",
      headers: (entry) => ({ "PRIVATE-TOKEN": String(entry.token ?? "") }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "GitLab token is valid." };
        return { valid: false, message: `GitLab request failed with status ${response.status}.` };
      }
    },
    gitea: {
      label: "Gitea",
      endpoint: "https://example.com/api/v1/user",
      method: "GET",
      headers: (entry) => ({ Authorization: `token ${String(entry.token ?? "")}` }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "Gitea token is valid." };
        return { valid: false, message: `Gitea request failed with status ${response.status}.` };
      }
    },
    hashicorp: {
      label: "HashiCorp",
      endpoint: "https://app.terraform.io/api/v2/account/details",
      method: "GET",
      headers: (entry) => ({ Authorization: `Bearer ${String(entry.token ?? "")}` }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "HashiCorp token is valid." };
        return { valid: false, message: `HashiCorp request failed with status ${response.status}.` };
      }
    },
    terraform: {
      label: "Terraform Cloud",
      endpoint: "https://app.terraform.io/api/v2/account/details",
      method: "GET",
      headers: (entry) => ({ Authorization: `Bearer ${String(entry.token ?? "")}` }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "Terraform token is valid." };
        return { valid: false, message: `Terraform request failed with status ${response.status}.` };
      }
    },
    ansible: {
      label: "Ansible",
      endpoint: "https://cloud.redhat.com/api/automation-hub/v3/_ui/v1/me/",
      method: "GET",
      headers: (entry) => ({ Authorization: `Token ${String(entry.token ?? "")}` }),
      validate: (response) => {
        if (response.status >= 200 && response.status < 300) return { valid: true, message: "Ansible token is valid." };
        return { valid: false, message: `Ansible request failed with status ${response.status}.` };
      }
    }
  };
}

export function getKeyPreview(entry: Partial<ApiKeyEntry>): string {
  const key = entry.key || entry.token || entry.secret || "(missing)";
  return previewKey(key);
}

export function parseBulkInput(raw: string): ApiKeyEntry[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (Array.isArray(parsed)) return parsed.map((item) => normalizeEntry((item as Partial<ApiKeyEntry>) ?? {}));
    if (parsed && typeof parsed === "object" && "keys" in parsed && Array.isArray((parsed as { keys: unknown[] }).keys)) {
      return ((parsed as { keys: unknown[] }).keys as unknown[]).map((item) => normalizeEntry((item as Partial<ApiKeyEntry>) ?? {}));
    }
    if (parsed && typeof parsed === "object") return [normalizeEntry(parsed as Partial<ApiKeyEntry>)];
  } catch {
    // fall back to line parsing below
  }

  const lines = trimmed.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).filter((line) => !line.startsWith("#"));
  const entries: ApiKeyEntry[] = [];

  for (const line of lines) {
    const parts = line.includes(",") ? splitCsvLine(line) : line.split(/\s*:\s*|\s+/);
    const provider = parts[0]?.trim();
    const key = parts[1]?.trim();
    if (provider && key) {
      entries.push(normalizeEntry({ provider, key }));
      continue;
    }
    entries.push(normalizeEntry({ provider: "openai", key: line }));
  }

  return entries;
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  result.push(current.trim());
  return result;
}
