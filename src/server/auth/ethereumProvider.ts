import { type User } from "@prisma/client";
import type { NextAuthOptions } from "next-auth";

import verifySignature from "~/helpers/verifySignature";
import { db } from "~/server/db";

type EthereumProviderConfig = {
  createUser: (credentials: { address: string }) => Promise<User>;
}
export const EthereumProvider = ({ createUser }: EthereumProviderConfig): NextAuthOptions["providers"][number] => ({
  id: "ethereum",
  name: "Ethereum",
  type: "credentials",
  credentials: {
    message: { label: "Message", type: "text" },
    signature: { label: "Signature", type: "text" },
    address: { label: "Address", type: "text" },
  },
  async authorize(credentials) {
    if (!credentials?.message || !credentials?.signature || !credentials?.address) {
      return null;
    }

    try {
      const isValid = await verifySignature(
        credentials.message,
        credentials.signature,
        credentials.address as `0x${string}`,
      );

      if (isValid) {
        // if the credentials.message includes "Link User:", we can extract the user id
        const linkUserRegex = /Link User: ([a-zA-Z0-9]+)/;
        // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
        const linkUserMatch = credentials.message.match(linkUserRegex);;
        const linkUser = linkUserMatch ? linkUserMatch[1] : undefined;
        // user is linking their ethereum address to an existing account
        if (linkUser) {
          return linkAddressToExistingUser({
            existingUserId: linkUser
          });
        }

        let user = await db.user.findFirst({
          where: { address: credentials.address },
        });

        if (!user) {
          user = await createUser({ address: credentials.address });
        }

        return {
          id: user.id,
          address: credentials.address,
        }
      }

      console.error("Signature verification failed")
      return null
    } catch (error) {
      console.error("Error verifying message:", error)
      return null
    }

    async function linkAddressToExistingUser({ existingUserId }: { existingUserId: string }) {
      if (!credentials?.address) return null;

      // check if the user who is trying to link (the ethereum wallet that signed)
      // has already linked an ethereum address
      const ethereumWalletUser = await db.user.findFirst({
        where: {
          address: credentials.address,
        },
      });
      // if the user has already linked an ethereum address to another user,
      // we should remove the link before linking to the new user
      // 
      // this can happen if the user signs in as a guest and connects their wallet
      // then the come back later and try to connect their ethereum wallet to another
      // guest account. We should remove the link to the first guest account. 
      
      // delete the existing link
      if (ethereumWalletUser) {
        await db.user.update({
          where: {
            id: ethereumWalletUser.id,
          },
          data: {
            address: null,
          },
        });
        // delete the associated ethereum account
        await db.account.deleteMany({
          where: {
            userId: ethereumWalletUser.id,
            type: "ethereum",
          },
        });
      }

      const existingLinkedUser = await db.user.findUnique({
        where: {
          id: existingUserId,
        },
      });
      if (existingLinkedUser?.address) {
        console.error("User already has an ethereum address linked")
        return null;
      }
      const user = await db.user.update({
        where: {
          id: existingUserId,
        },
        data: {
          address: credentials.address,
        },
      });
      await db.account.create({
        data: {
          userId: user.id,
          type: "ethereum",
          provider: "ethereum",
          providerAccountId: credentials.address,
        },
      });

      return {
        id: user.id,
        address: credentials.address,
      }
    }
  },
});