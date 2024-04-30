# 🔥 Burner Connector

## Quickstart

1. Install the dependencies:

```bash
npm install @scaffold-eth/burner-connector

or

yarn add @scaffold-eth/burner-connector

or

pnpm add @scaffold-eth/burner-connector
```

2. Using wagmi `burner` connector :

```ts
import { burner } from "@scaffold-eth/burner-connector";
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
import { rainbowkitBurnerWallet } from "@scaffold-eth/burner-connector";
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
