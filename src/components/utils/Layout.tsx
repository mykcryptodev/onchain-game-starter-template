import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { type FC, type ReactNode } from "react";
import { useAccount } from "wagmi";

import { Wallet } from "~/components/Wallet";
import SignInWithEthereum from "~/components/Wallet/SignIn";
import { APP_NAME } from "~/constants";

type Props = {
  children: ReactNode;
};

export const Layout: FC<Props> = ({ children }) => {
  const { address } = useAccount();
  const { data: sessionData } = useSession();
  console.log({ sessionData });
  
  return (
    <div className="flex flex-col gap-2 max-w-3xl mx-auto px-2">
      <div className="flex flex-col gap-2 w-full max-w-7xl mx-auto my-4 mb-20">
        <div className="flex items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Image src="/images/icon.png" width={48} height={48} alt={`${APP_NAME} Logo`} />
              <span className="sm:flex hidden">{APP_NAME}</span>
            </h1>
          </Link>
          <div className="flex items-center gap-2">
            {/* user is not connected with their wallet */}
            {!address && (
              <Wallet withWalletAggregator />
            )}
            {/* user is connected but not signed in */}
            {address && !sessionData?.user && (
              <SignInWithEthereum showDisconnect={true} />
            )}
            {/* user is connected and signed in */}
            {address && sessionData?.user && (
              <Wallet withWalletAggregator />
            )}
          </div>
        </div>
      </div>
      <div className="container mx-auto">
        {children}
      </div>
    </div>
  );
};

export default Layout;