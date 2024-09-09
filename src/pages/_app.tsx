import { FrameMetadata } from '@coinbase/onchainkit/frame';
import { type AppType } from "next/app";
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { ToastContainer } from 'react-toastify';

import Layout from "~/components/utils/Layout";
import { APP_DESCRIPTION, APP_NAME, APP_URL } from "~/constants";
import { api } from "~/utils/api";

import 'react-toastify/dist/ReactToastify.css';
import '@coinbase/onchainkit/styles.css';
import "~/styles/globals.css";

const pageTitle = `Play ${APP_NAME}`;
const pageDescription = APP_DESCRIPTION;
const pageUrl = APP_URL;
const imageUrl = `${APP_URL}/images/og.gif`;

const OnchainProviders = dynamic(
  () => import('~/providers/OnchainProviders'),
  {
    ssr: false,
  },
);

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="icon" href="/favicon.ico" />

        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={imageUrl} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={imageUrl} />
        <FrameMetadata
          buttons={[
            {
              action: 'link',
              label: pageTitle,
              target: pageUrl,
            },
          ]}
          image={{
            src: imageUrl,
            aspectRatio: '1.91:1'
          }}
        />
      </Head>
      <SessionProvider session={session}>
        <OnchainProviders>
          <Layout>
            <Component {...pageProps} />
            <ToastContainer position="top-center" />
          </Layout>
          <div id="portal" />
        </OnchainProviders>
      </SessionProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
