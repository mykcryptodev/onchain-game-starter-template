import Head from "next/head";
import { useSession } from "next-auth/react";
import { useAccount } from "wagmi";

import CreateGame from "~/components/Game/Create";
import { Wallet } from "~/components/Wallet";
import SignInWithEthereum from "~/components/Wallet/SignIn";
import { APP_DESCRIPTION, APP_NAME } from "~/constants";

export default function Home() {
  const { address } = useAccount();
  const { data: sessionData } = useSession();
  
  return (
    <>
      <Head>
        <title>{APP_NAME}</title>
        <meta name="description" content={APP_DESCRIPTION} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col justify-center">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight text-center">
            {APP_NAME}
          </h1>
          {!address && (
            <Wallet btnLabel="Connect Wallet To Play" />
          )}
          {address && !sessionData?.user && (
            <SignInWithEthereum btnLabel="Sign In To Play" />
          )}
          {address && sessionData?.user && (
            <CreateGame btnLabel="Start Game" />
          )}
        </div>
      </main>
    </>
  );
}