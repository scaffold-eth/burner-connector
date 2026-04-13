import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { createConfig } from "wagmi";
import { hardhat, mainnet, optimismSepolia } from "viem/chains";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { fallback, http } from "viem";
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

// SE-2's public default Alchemy key — used here to demonstrate transport inheritance.
// The burner should inherit these transports automatically (no need to also set
// `rainbowkitBurnerWallet.rpcUrls`).
const ALCHEMY_KEY = "cR4WnXePioePZ5fFrnSiR";

export const chains = [mainnet, optimismSepolia, hardhat] as const;

export const wagmiConfig = createConfig({
  chains: chains,
  connectors: wagmiConnectors,
  ssr: true,
  transports: {
    [mainnet.id]: fallback([
      http(`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`),
      http("https://mainnet.rpc.buidlguidl.com"),
      http(),
    ]),
    [optimismSepolia.id]: fallback([http(`https://opt-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`), http()]),
    [hardhat.id]: http(),
  },
});
