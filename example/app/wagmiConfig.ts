import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { createConfig } from "wagmi";
import { hardhat, optimismSepolia } from "viem/chains";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { createClient, http } from "viem";
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

export const chains = [optimismSepolia, hardhat] as const;

export const wagmiConfig = createConfig({
  chains: chains,
  connectors: wagmiConnectors,
  ssr: true,
  client({ chain }) {
    return createClient({ chain, transport: http() });
  },
});
