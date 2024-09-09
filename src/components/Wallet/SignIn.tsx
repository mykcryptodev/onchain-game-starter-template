import { getCsrfToken, signIn, useSession } from 'next-auth/react';
import React, { type FC, useState } from 'react';
import { SiweMessage } from 'siwe';
import { useAccount, useDisconnect,useSignMessage } from 'wagmi';

import { APP_NAME } from '~/constants';

type Props = {
  btnLabel?: string;
  showDisconnect?: boolean;
}
const SignInWithEthereum: FC<Props> = ({ btnLabel, showDisconnect }) => {
  const { disconnect } = useDisconnect();
  const { data: sessionData } = useSession();
  const { signMessageAsync } = useSignMessage();
  const account = useAccount();
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
 
  const promptToSign = async () => {
    if (!account.address) return;
    setIsSigningIn(true);
    
    try {
      const nonce = await getCsrfToken();

      const message = new SiweMessage({
        domain: document.location.host,
        address: account.address,
        chainId: account.chainId,
        uri: document.location.origin,
        version: '1',
        statement: `Sign into ${APP_NAME}`,
        nonce,
      }).prepareMessage();

      const signature = await signMessageAsync({ message });

      const response = await signIn("ethereum", {
        message,
        signature,
        address: account.address,
        redirect: false,
      });

      if (response?.error) {
        throw new Error(response.error);
      }
    } catch (e) {
      console.error('Error signing in:', e);
    } finally {
      setIsSigningIn(false);
    }
  };
  if (sessionData?.user) return null;
  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={promptToSign}
        className="btn"
        disabled={isSigningIn}
      >
        {isSigningIn && (
          <div className="loading loading-spinner" />
        )}
        {btnLabel ?? 'Sign In with Ethereum'}
      </button>
      {showDisconnect && (
        <button
          onClick={() => disconnect()}
          className="btn btn-ghost"
        >
          Disconnect
        </button>
      )}
    </div>
  );
}

export default SignInWithEthereum;