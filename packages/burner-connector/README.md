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

2. Using wagmi `burner` connector :

```ts
import { burner } from "burner-connector";
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
import { rainbowkitBurnerWallet } from "burner-connector";

const wallets = [metaMaskWallet, rainbowkitBurnerWallet];

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
