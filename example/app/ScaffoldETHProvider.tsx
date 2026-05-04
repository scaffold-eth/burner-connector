"use client";

import dynamic from "next/dynamic";

// `ssr: false` avoids running WalletConnect's connector setup on the server,
// which throws `ReferenceError: indexedDB is not defined` from idb-keyval
// during `createConfig` → `connector.setup()`.
export const ScaffoldEthAppWithProviders = dynamic(
  () =>
    import("./ScaffoldETHProviderInner").then(
      (m) => m.ScaffoldEthAppWithProviders,
    ),
  { ssr: false },
);
