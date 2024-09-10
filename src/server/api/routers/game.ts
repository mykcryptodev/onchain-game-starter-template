import { type PrismaClient } from "@prisma/client";
import { tracked } from "@trpc/server";
import EventEmitter, { on } from "events";
import { createWalletClient, type Hex, http, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "wagmi/chains";
import { z } from "zod";

import { WINNER_CONTRACT } from "~/constants";
import { validWords } from "~/constants/words";
import { env } from "~/env";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

const ee = new EventEmitter();

export const gameRouter = createTRPCRouter({
  create: protectedProcedure.mutation(async ({ ctx }) => {
    // generate a random word from the word set
    const word =
      Array.from(validWords)[Math.floor(Math.random() * validWords.size)];
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
    .input(
      z.object({
        gameId: z.string(),
        guess: z.string().length(5),
      }),
    )
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
          statuses: Array(5).fill("absent" as const),
        };
      }

      // fetch the game
      const game = await ctx.db.game.findUnique({
        where: {
          id: gameId,
        },
      });

      if (!game) {
        throw new Error("Game not found");
      }

      const word = game.word.toLowerCase();
      const guessLower = guess.toLowerCase();

      // Check if the guess is a valid word
      if (!validWords.has(guessLower)) {
        throw new Error("Not a valid word");
      }

      // Determine the status of each letter
      const statuses = Array(5).fill("absent") as Array<
        "correct" | "present" | "absent"
      >;
      const wordArray = word.split("");

      // First pass: mark correct letters
      for (let i = 0; i < 5; i++) {
        if (guessLower[i] === wordArray[i]) {
          statuses[i] = "correct";
          wordArray[i] = "#"; // Mark as used
        }
      }

      // Second pass: mark present letters
      for (let i = 0; i < 5; i++) {
        if (statuses[i] === "absent") {
          const index = wordArray.indexOf(guessLower[i]!);
          if (index !== -1) {
            statuses[i] = "present";
            wordArray[index] = "#"; // Mark as used
          }
        }
      }

      // if this was guessed already throw error
      const existingGuess = await ctx.db.gameGuess.findFirst({
        where: {
          gameId,
          userId: ctx.session.user.id,
          guess: guessLower,
        },
      });

      if (existingGuess) {
        throw new Error("Guess already made");
      }

      // Create a new GameGuess
      await ctx.db.gameGuess.create({
        data: {
          gameId,
          userId: ctx.session.user.id,
          guess: guessLower,
        },
      });

      const isGuessCorrect = guessLower === word;

      let txHash: `0x${string}` | undefined;
      if (isGuessCorrect) {
        // write the winner onchain
        const account = privateKeyToAccount(env.ADMIN_PRIVATE_KEY as Hex);
        const client = createWalletClient({
          account,
          chain: baseSepolia,
          transport: http(),
        });
        try {
          txHash = await client.writeContract({
            address: WINNER_CONTRACT,
            abi: parseAbi([
              "function recordWinner(string memory _gameId, address _winner, uint256 _guessCount)",
            ]),
            functionName: "recordWinner",
            args: [game.id, account.address, BigInt(guessCount + 1)],
          });
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          console.log({ e });
          throw new Error("Failed to record winner onchain: ");
        }
      }

      return {
        isGameOver: isGuessCorrect,
        isGuessCorrect,
        numberOfGuesses: guessCount + 1,
        statuses,
        txHash,
      };
    }),
  getGuesses: protectedProcedure
    .input(
      z.object({
        gameId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { gameId } = input;

      const guesses = await ctx.db.gameGuess.findMany({
        where: {
          gameId,
          userId: ctx.session.user.id,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      const guessesWithStatuses = await Promise.all(guesses.map(async (guess) => ({
        guess: guess.guess.toUpperCase(),
        statuses: calculateStatuses(
          guess.guess,
          await getGameWord(ctx.db, gameId),
        ),
      })));

      return guessesWithStatuses;
    }),
  getAnswerWord: protectedProcedure
    .input(
      z.object({
        gameId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { gameId } = input;

      // Check if the user has made 6 guesses
      const guessCount = await ctx.db.gameGuess.count({
        where: {
          gameId,
          userId: ctx.session.user.id,
        },
      });

      if (guessCount < 6) {
        throw new Error("Not allowed to view answer yet");
      }

      const game = await ctx.db.game.findUnique({
        where: { id: gameId },
        select: { word: true },
      });

      if (!game) {
        throw new Error("Game not found");
      }

      return game.word.toUpperCase();
    }),
  // This procedure is unused in this example but it showcases
  // how to subscribe to database updates from the client.
  // If you use subscriptions, be sure that your servers do not
  // go to sleep or you will lose the connection.
  onUpdate: publicProcedure
    .input(
      z
        .object({
          // lastEventId is the last event id that the client has received
          // On the first call, it will be whatever was passed in the initial setup
          // If the client reconnects, it will be the last event id that the client received
          lastEventId: z.string().nullish(),
        })
        .optional(),
    )
    .subscription(async function* (opts) {
      console.log("Subscription initiated for game:", opts?.input?.lastEventId);
      if (opts?.input?.lastEventId) {
        // [...] get the game since the last event id and yield them
        const game = await getGame({
          input: { id: opts.input.lastEventId },
          ctx: opts.ctx,
        });
        yield tracked(game.id, game);
      }
      // listen for new events
      for await (const [data] of on(ee, "updateGame")) {
        const gameId = data as string;
        const game = await getGame({ input: { id: gameId }, ctx: opts.ctx });
        // tracking the post id ensures the client can reconnect at any time and get the latest events this id
        yield tracked(game.id, game);
      }
    }),
});

// Helper function to get the game word
async function getGameWord(db: PrismaClient, gameId: string): Promise<string> {
  const game = await db.game.findUnique({
    where: { id: gameId },
    select: { word: true },
  });
  if (!game) throw new Error("Game not found");
  return game.word.toLowerCase();
}

// Helper function to calculate statuses
function calculateStatuses(
  guess: string,
  word: string,
): Array<"correct" | "present" | "absent"> {
  const statuses = Array(5).fill("absent") as Array<
    "correct" | "present" | "absent"
  >;
  const wordArray = word.split("");

  // First pass: mark correct letters
  for (let i = 0; i < 5; i++) {
    if (guess[i] === wordArray[i]) {
      statuses[i] = "correct";
      wordArray[i] = "#"; // Mark as used
    }
  }

  // Second pass: mark present letters
  for (let i = 0; i < 5; i++) {
    if (statuses[i] === "absent") {
      const index = wordArray.indexOf(guess[i]!);
      if (index !== -1) {
        statuses[i] = "present";
        wordArray[index] = "#"; // Mark as used
      }
    }
  }

  return statuses;
}

// helper function to get a game with all of the data we need
async function getGame({
  input,
  ctx,
}: {
  input: { id: string };
  ctx: { db: PrismaClient };
}) {
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
