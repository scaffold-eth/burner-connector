import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { createConfig } from "wagmi";
import { hardhat, mainnet, optimismSepolia } from "viem/chains";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { createClient, fallback, http } from "viem";
import { rainbowkitBurnerWallet } from "burner-connector";

// Use this if you want to enable session storage
// rainbowkitBurnerWallet.useSessionStorage = true;

/* Use custom RPC URLs to override wagmi's default RPC URLs if needed */
/* rainbowkitBurnerWallet.rpcUrls = {
  [optimismSepolia.id]: `https://opt-sepolia.g.alchemy.com/v2/${alchemyAPIKey}`,
}; */

const wallets = [metaMaskWallet, rainbowkitBurnerWallet];
const walletConnectProjectID = "3a8170812b534d0ff9d794f19a901d64";
const wagmiConnectors = connectorsForWallets(
  [
    {
      groupName: "Supported Wallets",
      wallets,
    },
  ],

  {
    appName: "scaffold-eth-2",
    projectId: walletConnectProjectID,
  }
);

const ALCHEMY_KEY = "cR4WnXePioePZ5fFrnSiR";

export const chains = [mainnet, optimismSepolia, hardhat] as const;

export const wagmiConfig = createConfig({
  chains: chains,
  connectors: wagmiConnectors,
  ssr: true,
  client({ chain }) {
    const alchemyUrl =
      chain.id === mainnet.id
        ? `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`
        : chain.id === optimismSepolia.id
          ? `https://opt-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`
          : undefined;

    const transports = alchemyUrl
      ? fallback([http(alchemyUrl), http("https://mainnet.rpc.buidlguidl.com"), http()])
      : fallback([http()]);

    return createClient({
      chain,
      transport: transports,
    });
  },
});
