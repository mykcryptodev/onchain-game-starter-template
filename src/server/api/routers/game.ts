import { type PrismaClient } from "@prisma/client";
import { tracked } from "@trpc/server";
import EventEmitter, { on } from "events";
import { baseSepolia } from "wagmi/chains";
import { z } from "zod";

import { validWords } from "~/constants/words";
import { env } from "~/env";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";

const ee = new EventEmitter();


export const gameRouter = createTRPCRouter({
  create: protectedProcedure
    .mutation(async ({ ctx }) => {
      // generate a random word from the word set
      const word = Array.from(validWords)[Math.floor(Math.random() * validWords.size)];
      if (!word) {
        throw new Error("No word found");
      }

      return await ctx.db.game.create({
        data: {
          createdById: ctx.session.user.id,
          word,
        },
      });
    }),
  guess: protectedProcedure
    .input(z.object({
      gameId: z.string(),
      guess: z.string().length(5),
    }))
    .mutation(async ({ ctx, input }) => {
      const { gameId, guess } = input;

      // Check if the user has already made 6 guesses for this game
      const guessCount = await ctx.db.gameGuess.count({
        where: {
          gameId,
          userId: ctx.session.user.id,
        },
      });

      if (guessCount >= 6) {
        return {
          isGameOver: true,
          isGuessCorrect: false,
          numberOfGuesses: guessCount,
        }
      }

      // Create a new GameGuess
      await ctx.db.gameGuess.create({
        data: {
          gameId,
          userId: ctx.session.user.id,
          guess,
        },
      });

      // fetch the game
      const game = await ctx.db.game.findUnique({
        where: {
          id: gameId,
        },
      });

      if (!game) {
        throw new Error("Game not found");
      }

      if (guess.toLowerCase() === game.word.toLowerCase()) {
        const res = await fetch(
          `https://engine-production-3357.up.railway.app/contract/${baseSepolia.id}/0x6D00988154557822c026747aADA9438B0661091B/write`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${env.ENGINE_ACCESS_TOKEN}`,
              "x-backend-wallet-address": `${env.ENGINE_WALLET_ADDRESS}`,
            },
            body: JSON.stringify({
              functionName: "recordWinner",
              args: [
                1,
                ctx.session.user.address,
                guessCount + 1,
              ],
            }),
          },
        );
        console.log({ res });

        return {
          isGameOver: true,
          isGuessCorrect: true,
          numberOfGuesses: guessCount,
        }
      }


      return {
        isGameOver: false,
        isGuessCorrect: false,
        numberOfGuesses: guessCount,
      }
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