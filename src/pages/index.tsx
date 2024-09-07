import Head from "next/head";

import Game from "~/components/Game";
import { APP_DESCRIPTION, APP_NAME } from "~/constants";

export default function Home() {
  return (
    <>
      <Head>
        <title>{APP_NAME}</title>
        <meta name="description" content={APP_DESCRIPTION} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col justify-center">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight">
            {APP_NAME}
          </h1>
          <Game />
        </div>
      </main>
    </>
  );
}