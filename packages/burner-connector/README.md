# 🔥 Burner Connector

## Quickstart

1. Install the dependencies:

```bash
npm install burner-connector

or

yarn add burner-connector

or

pnpm add burner-connector
```

2. Using wagmi `burner` connector:

```ts
import { burner } from "burner-connector";
import { mainnet, base } from "viem/chains";

// Configuration options:
// - `useSessionStorage` (optional) : false (default) to persist wallet across browser tabs
//                       true to create a new wallet for each browser tab
// - `rpcUrls` (optional) : custom RPC URLs for specific chain IDs

// Basic usage without options
export const config = createConfig({
  chains: [mainnet, base],
  connectors: [burner()],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
  },
});

// Example with all options
export const config = createConfig({
  chains: [mainnet, base],
  connectors: [
    burner({
      useSessionStorage: true,
      rpcUrls: {
        1: "https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY",
        8453: "https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY",
      },
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
  },
});
```

3. Integrate with rainbowkit:

```ts
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { rainbowkitBurnerWallet } from "burner-connector";
import { mainnet, base } from "viem/chains";

// Configure burner wallet options
// Storage configuration:
// - useSessionStorage: false (default) to persist wallet across browser tabs
//                     true to create a new wallet for each browser tab
rainbowkitBurnerWallet.useSessionStorage = true;

// Custom RPC URLs configuration (optional):
rainbowkitBurnerWallet.rpcUrls = {
  1: "https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY",
  8453: "https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY",
};

const wallets = [metaMaskWallet, rainbowkitBurnerWallet];

const wagmiConnectors = connectorsForWallets(
  [
    {
      groupName: "Supported Wallets",
      wallets,
    },
  ],
  {
    appName: "scaffold-eth-2",
    projectId: "YOUR_WALLET_CONNECT_PROJECT_ID",
  },
);

const wagmiConfig = createConfig({
  chains: [mainnet, base],
  connectors: wagmiConnectors,
  ssr: true,
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
  },
});
```

## Configuration Options

### Burner Connector Options

| Option                         | Type                     | Default     | Description                                                                                     |
| ------------------------------ | ------------------------ | ----------- | ----------------------------------------------------------------------------------------------- |
| `useSessionStorage` (optional) | `boolean`                | `false`     | When true, creates a new wallet for each browser tab. When false, persists wallet across tabs.  |
| `rpcUrls` (optional)           | `Record<number, string>` | `undefined` | Optional custom RPC URLs for specific chain IDs. Falls back to chain's default if not provided. |

---

Checkout [CONTRIBUTING.md](/CONTRIBUTING.md) for more details on how to set it up locally.
