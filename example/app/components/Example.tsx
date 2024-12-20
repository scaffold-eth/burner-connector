import {
  useAccount,
  useReadContract,
  useSignMessage,
  useWriteContract,
} from "wagmi";
import { FaucetButton } from "./FaucetButton";
import toast from "react-hot-toast";
import deployedContracts from "../contracts/deployedContracts";
import { optimismSepolia } from "viem/chains";

export const Example = () => {
  const { isConnected, chain } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const { writeContractAsync, isPending } = useWriteContract();

  console.log("isPending", isPending);
  const yourContract =
    chain?.id && chain.id in deployedContracts
      ? deployedContracts[chain.id as keyof typeof deployedContracts]
          .YourContract
      : deployedContracts[optimismSepolia.id].YourContract;

  const { data: totalCounter } = useReadContract({
    ...yourContract,
    functionName: "totalCounter",
  });

  const handleSetGreetings = async () => {
    try {
      await writeContractAsync({
        ...yourContract,
        functionName: "setGreeting",
        args: ["Hello World"],
      });
      toast.success("Greetings send");
    } catch (err) {
      console.log(err, "err");
      toast.error("Error Sending Message");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <FaucetButton />
      {isConnected && (
        <button
          className="h-8 px-4 text-sm text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800"
          onClick={async () => {
            try {
              const signature = await signMessageAsync({
                message: "hello",
              });
              console.log("Signature is :", signature);
              toast.success("Message Signed");
            } catch (err) {
              console.log(err, "err");
              toast.error("Error Signing Message");
            }
          }}
        >
          Sign Message
        </button>
      )}
      <button
        className="h-8 px-4 text-sm text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800"
        disabled={isPending}
        onClick={handleSetGreetings}
      >
        {isPending ? "Sending..." : "Send Hello world greeting"}
      </button>
      <p>Reading total count: {totalCounter ? totalCounter.toString() : 0}</p>
    </div>
  );
};
