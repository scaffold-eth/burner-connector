import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { createConfig } from "wagmi";
import { hardhat, sepolia } from "wagmi/chains";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { createClient, http } from "viem";
import { rainbowkitBurnerWallet } from "burner-connector";

const wallets = [
  metaMaskWallet,
  // default burner wallet
  rainbowkitBurnerWallet,
  // burner wallet with custom id and name
  rainbowkitBurnerWallet({ id: "burnerWallet1", name: "Burner Wallet 1" }),
  rainbowkitBurnerWallet({ id: "burnerWallet2", name: "Burner Wallet 2" }),
];
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
  },
);

export const chains = [sepolia, hardhat] as const;

export const wagmiConfig = createConfig({
  chains: chains,
  connectors: wagmiConnectors,
  ssr: true,
  client({ chain }) {
    return createClient({ chain, transport: http() });
  },
});
