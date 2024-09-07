import { type PrismaClient } from "@prisma/client";
import { tracked } from "@trpc/server";
import EventEmitter, { on } from "events";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";

const ee = new EventEmitter();

export const gameRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ 
      name: z.string().min(1),
    }))
    .mutation(async ({ ctx }) => {
      return await ctx.db.game.create({
        data: {
          createdById: ctx.session.user.id,
        },
      });
    }),
  onUpdate: publicProcedure
    .input(
      z.object({
        // lastEventId is the last event id that the client has received
        // On the first call, it will be whatever was passed in the initial setup
        // If the client reconnects, it will be the last event id that the client received
        lastEventId: z.string().nullish(),
      }).optional(),
    )
    .subscription(async function* (opts) {
      console.log("Subscription initiated for game:", opts?.input?.lastEventId);
      if (opts?.input?.lastEventId) {
        // [...] get the game since the last event id and yield them
        const game = await getGame({ input: { id: opts.input.lastEventId }, ctx: opts.ctx });
        yield tracked(game.id, game);
      }
      // listen for new events
      for await (const [data] of on(ee, 'updateGame')) {
        const gameId = data as string;
        const game = await getGame({ input: { id: gameId }, ctx: opts.ctx });
        // tracking the post id ensures the client can reconnect at any time and get the latest events this id
        yield tracked(game.id, game);
      }
    }),
});

// helper function to get a game with all of the data we need
async function getGame({ input, ctx }: { input: { id: string }, ctx: { db: PrismaClient } }) {
  const game = await ctx.db.game.findUnique({
    where: {
      id: input.id,
    },
    include: {
      createdBy: true,
    },
  });
  if (!game) {
    throw new Error("Game not found");
  }
  return game;
}