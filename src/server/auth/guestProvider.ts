import { type NextAuthOptions } from "next-auth";

import { db } from "~/server/db";

export const GuestProvider = (): NextAuthOptions["providers"][number] => ({
  id: "guest",
  name: "Guest",
  type: "credentials",
  credentials: {},
  async authorize() {
    const user = await db.user.create({
      data: {
        name: null,
        email: null,
        image: null,
      },
    });

    // create a guest account for this user
    await db.account.create({
      data: {
        userId: user.id,
        type: "guest",
        provider: "guest",
        providerAccountId: user.id,
      },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    };
  },
});