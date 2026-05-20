/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GTM_CONTAINER_ID?: string;
  readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
