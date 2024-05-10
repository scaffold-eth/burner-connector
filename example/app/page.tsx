"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSignMessage } from "wagmi";

export default function Home() {
  const { isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <ConnectButton />
        {isConnected && (
          <button
            className="h-8 px-4 m-2 text-sm text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800"
            onClick={async () => {
              try {
                const signature = await signMessageAsync({
                  message: "hello",
                });

                console.log("Signature is :", signature);
              } catch (err) {
                console.log(err, "err");
              }
            }}
          >
            Sign Message
          </button>
        )}
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:size-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://buidlguidl.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            By Buidlguidl
          </a>
        </div>
      </div>
    </main>
  );
}
