"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Chain, createWalletClient, http, parseEther } from "viem";
import { hardhat } from "viem/chains";
import { useAccount } from "wagmi";

// Number of ETH faucet sends to an address
const NUM_OF_ETH = "1";
const FAUCET_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

const localWalletClient = createWalletClient({
  chain: hardhat as Chain,
  transport: http(),
});

/**
 * FaucetButton button which lets you grab eth.
 */
export const FaucetButton = () => {
  const { address, chain: ConnectedChain } = useAccount();

  const [loading, setLoading] = useState(false);

  let displayAddress = address?.slice(0, 6) + "..." + address?.slice(-4);
  const sendETH = async () => {
    if (!address) return;
    try {
      setLoading(true);
      await localWalletClient.sendTransaction({
        account: FAUCET_ADDRESS,
        to: address,
        value: parseEther(NUM_OF_ETH),
      });
      toast.success(`Sent ${NUM_OF_ETH} ETH to ${displayAddress}`);
      setLoading(false);
    } catch (error) {
      toast.error("Error sending the ETH");
      console.error("⚡️ ~ file: FaucetButton.tsx:sendETH ~ error", error);
      setLoading(false);
    }
  };

  // Render only on local chain
  if (ConnectedChain?.id !== hardhat.id) {
    return null;
  }

  return (
    <div>
      <button
        className="h-8 px-4 m-2 text-sm text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800"
        onClick={sendETH}
        disabled={loading}
      >
        {!loading ? "Get ETH" : "Loading..."}
      </button>
    </div>
  );
};
