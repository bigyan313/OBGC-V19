/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HELIUS_API_KEY: string
  readonly VITE_HELIUS_RPC_URL: string
  readonly VITE_HELIUS_WS_URL: string
  readonly VITE_HELIUS_ECLIPSE_URL: string
  readonly VITE_HELIUS_PARSE_TX_URL: string
  readonly VITE_HELIUS_PARSE_HISTORY_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Extend global process for browser compatibility
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly VITE_HELIUS_API_KEY: string
      readonly VITE_HELIUS_RPC_URL: string
      readonly VITE_HELIUS_WS_URL: string
      readonly VITE_HELIUS_ECLIPSE_URL: string
      readonly VITE_HELIUS_PARSE_TX_URL: string
      readonly VITE_HELIUS_PARSE_HISTORY_URL: string
    }
  }

  interface Window {
    Buffer: typeof Buffer;
  }
}

// Anchor and Solana type extensions
declare module '@coral-xyz/anchor' {
  interface Program<T = any> {
    methods: any;
    account: any;
    rpc: any;
  }
}