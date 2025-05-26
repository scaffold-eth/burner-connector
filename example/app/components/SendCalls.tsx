import { useAccount, useCallsStatus } from "wagmi";
import toast from "react-hot-toast";
import deployedContracts from "../contracts/deployedContracts";
import { optimismSepolia } from "viem/chains";
import { useSendCalls } from "wagmi";
import { encodeFunctionData } from "viem";

interface SendCallsProps {
  onSuccess?: () => void;
}

export const SendCalls = ({ onSuccess }: SendCallsProps) => {
  const { chain } = useAccount();

  const {
    sendCallsAsync,
    isPending: isSendingCalls,
    data: callsData,
  } = useSendCalls();

  const {
    data: callsStatus,
    refetch: refetchCallsStatus,
    isFetching: isFetchingCallsStatus,
  } = useCallsStatus({
    id: callsData?.id ?? "",
    query: {
      enabled: !!callsData?.id,
    },
  });

  const yourContract =
    chain?.id && chain.id in deployedContracts
      ? deployedContracts[chain.id as keyof typeof deployedContracts]
          .YourContract
      : deployedContracts[optimismSepolia.id].YourContract;

  const handleSendCalls = async () => {
    try {
      const firstData = encodeFunctionData({
        abi: yourContract.abi,
        functionName: "setGreeting",
        args: ["Hello once"],
      });
      const secondData = encodeFunctionData({
        abi: yourContract.abi,
        functionName: "setGreeting",
        args: ["Hello twice"],
      });
      const result = await sendCallsAsync({
        calls: [
          { to: yourContract.address, data: firstData },
          { to: yourContract.address, data: secondData },
        ],
      });
      console.log("result", result);
      toast.success("Calls sent");
      onSuccess?.();
    } catch (err) {
      console.log(err, "err");
      toast.error("Error Sending Calls");
    }
  };

  return (
    <div>
      <h2 className="font-bold mb-2">Send Calls</h2>
      <button
        className="h-8 px-4 text-sm text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800"
        disabled={isSendingCalls}
        onClick={handleSendCalls}
      >
        {isSendingCalls ? "Sending..." : "Send multiple greetings"}
      </button>
      {callsData?.id && (
        <button
          className="ml-2 h-8 px-4 text-xs text-indigo-700 border border-indigo-700 rounded-lg hover:bg-indigo-100"
          onClick={() => refetchCallsStatus()}
        >
          {isFetchingCallsStatus ? "Loading..." : "Refetch Calls Status"}
        </button>
      )}
      {callsData?.id && (
        <div className="mt-2 w-full">
          <p className="mb-1 font-medium">Call ID:</p>
          <div className="p-2 bg-gray-800 text-gray-100 rounded overflow-x-auto w-full max-w-2xl">
            <code className="text-sm whitespace-nowrap block">
              {callsData.id}
            </code>
          </div>
        </div>
      )}
      {callsStatus && (
        <>
          <p>Status: {callsStatus.status}</p>
          {callsStatus.receipts && callsStatus.receipts.length > 0 && (
            <div>
              <p>Receipt IDs:</p>
              <ul className="ml-4 list-disc">
                {callsStatus.receipts.map((r: any, i: number) => (
                  <li key={i} className="break-all">
                    {r.transactionHash}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};
