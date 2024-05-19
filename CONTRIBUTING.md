## Local setup

1. Build the package:

```bash
pnpm run build
```

This builds the `burner-connector` package.

2. Start the example repo:

```bash
pnpm run dev
```

This will start a local server on `http://localhost:3000` with the example app linked to local package

The burner wallet should be automatically connected to sepolia network, and can interact with the [`YourContract`](https://sepolia.etherscan.io/address/0x0D25b202D1B5126ECFcaeFa85f7a37ed86EF79ea) deployed on the sepolia.

## Testing with hardhat

For this we will be needing a `YourContract` contract deployed on the hardhat network.

Follow the [quick start guide of Scaffold-ETH](https://github.com/scaffold-eth/scaffold-eth-2?tab=readme-ov-file#quickstart) till point 3 to deploy `YourContract` on hardhat network.

Since the SE-2 first deployment of `YourContract` results in same address, we already have the abi and address present in `example/contracts/deployedContract.ts`

Running `pnpm run dev` and switching to hardhat network in the burner wallet should now allow you to interact with the `YourContract` deployed on hardhat network.
