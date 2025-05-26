import {
  useAccount,
  useReadContract,
  useSignMessage,
  useWriteContract,
} from "wagmi";
import { FaucetButton } from "./FaucetButton";
import { SendCalls } from "./SendCalls";
import toast from "react-hot-toast";
import deployedContracts from "../contracts/deployedContracts";
import { optimismSepolia } from "viem/chains";
import { useCapabilities } from "wagmi";
import React, { useState } from "react";

export const Example = () => {
  const { isConnected, chain } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { data: capabilities } = useCapabilities();
  const { writeContractAsync, isPending } = useWriteContract();
  const yourContract =
    chain?.id && chain.id in deployedContracts
      ? deployedContracts[chain.id as keyof typeof deployedContracts]
          .YourContract
      : deployedContracts[optimismSepolia.id].YourContract;

  const { data: totalCounter, refetch: refetchTotalCounter } = useReadContract({
    ...yourContract,
    functionName: "totalCounter",
  });

  const [signature, setSignature] = useState<string | null>(null);
  const [greetingStatus, setGreetingStatus] = useState<string | null>(null);
  const [greetingTxHash, setGreetingTxHash] = useState<string | null>(null);

  const handleSetGreetings = async () => {
    try {
      const txHash = await writeContractAsync({
        ...yourContract,
        functionName: "setGreeting",
        args: ["Hello World"],
      });
      setGreetingStatus("Success");
      setGreetingTxHash(txHash);
      refetchTotalCounter();
    } catch (err) {
      setGreetingStatus("Error");
      setGreetingTxHash(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Faucet Section */}
      <div>
        <FaucetButton />
      </div>

      {/* Sign Message Section */}
      <div>
        <h2 className="font-bold mb-2">Sign Message</h2>
        {isConnected && (
          <button
            className="h-8 px-4 text-sm text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800"
            onClick={async () => {
              try {
                const sig = await signMessageAsync({ message: "hello" });
                console.log("Signature is :", sig);
                setSignature(sig);
                toast.success("Message Signed");
              } catch {
                setSignature("Error");
                toast.error("Error Signing Message");
              }
            }}
          >
            Sign Message
          </button>
        )}
        {signature && <p>Signature: {signature}</p>}
      </div>

      {/* Send Greeting Section */}
      <div>
        <h2 className="font-bold mb-2">Send Transaction</h2>
        <button
          className="h-8 px-4 text-sm text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800"
          disabled={isPending}
          onClick={handleSetGreetings}
        >
          {isPending ? "Sending..." : "Send Hello world greeting"}
        </button>
        {greetingStatus === "Success" && greetingTxHash && (
          <p>
            Tx Hash: <span className="break-all">{greetingTxHash}</span>
          </p>
        )}
        {greetingStatus === "Error" && <p>Status: Error</p>}
      </div>

      {/* Send Multiple Greetings Section */}
      <SendCalls onSuccess={() => refetchTotalCounter()} />

      {/* Total Counter Section */}
      <div>
        <h2 className="font-bold mb-2">Total Counter</h2>
        <button
          className="mb-2 h-8 px-4 text-xs text-indigo-700 border border-indigo-700 rounded-lg hover:bg-indigo-100"
          onClick={() => refetchTotalCounter()}
        >
          Refetch Total Counter
        </button>
        <p>Reading total count: {totalCounter ? totalCounter.toString() : 0}</p>
      </div>

      {/* Capabilities Section */}
      <div>
        <h2 className="font-bold mb-2">Capabilities</h2>
        <pre className="bg-gray-800 text-gray-100 p-2 rounded text-xs overflow-x-auto">
          {capabilities
            ? JSON.stringify(capabilities, null, 2)
            : "No capabilities available."}
        </pre>
      </div>
    </div>
  );
};
