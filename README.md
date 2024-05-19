# 🔥 Burner Connector

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v18.17)](https://nodejs.org/en/download/)
- [pnpm](https://pnpm.io/installation#using-corepack)
- [Git](https://git-scm.com/downloads)

## Quickstart

1. Install the dependencies:

```bash
npm install burner-connector

or

yarn add burner-connector

or

pnpm add burner-connector
```

2. Using wagmi `burner` connector :

```ts
import { burner } from "burner-connector";
import { mainnet, base } from "viem/chains";
export const config = createConfig({
  chains: [mainnet, base],
  connectors: [burner()],
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

---

Checkout [CONTRIBUTING.md](/CONTRIBUTING.md) for more details on how to set it up locally.
