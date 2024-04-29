# 🔥 Burner Connector

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v18.17)](https://nodejs.org/en/download/)
- [pnpm](https://pnpm.io/installation#using-corepack)
- [Git](https://git-scm.com/downloads)

## Quickstart

1. Install the dependencies:

```bash
npm install burner-connector-test01

or

yarn add burner-connector-test01

or

pnpm add burner-connector-test01
```

2. Using wagmi `burner` connector :

```ts
import { burner } from "burner-connector-test01";
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
import { rainbowkitBurnerWallet } from "burner-connector-test01";

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

## Local setup

1. Build the package:

```bash
pnpm run build
```

2. Start the example repo:

```bash
pnpm run dev
```

This will start a local server on `http://localhost:3000` with the example app linked to local package
