/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** TallyConnect base URL, e.g. http://localhost:8000 (no trailing slash). Blank = use the dev proxy / same origin. */
  readonly VITE_TALLY_API_URL?: string;
  /** TallyConnect API key (tc_live_...). A `read_only` key is enough for this module. */
  readonly VITE_TALLY_API_KEY?: string;
  /** Optional: when set, `npm run dev` proxies /api and /health to this target (avoids CORS in dev). */
  readonly VITE_TALLY_PROXY_TARGET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
