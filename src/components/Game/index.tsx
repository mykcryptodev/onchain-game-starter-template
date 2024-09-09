/* eslint-disable @typescript-eslint/prefer-regexp-exec */
import type { FC } from 'react';
import React, { useEffect, useRef, useState } from 'react';

import CreateGame from '~/components/Game/Create';
import { api } from '~/utils/api';

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

type TileProps = {
  char: string;
  status: 'correct' | 'present' | 'absent' | 'empty';
};

const Tile: FC<TileProps> = ({ char, status }) => {
  const backgroundColor = {
    correct: '#6aaa64',
    present: '#c9b458',
    absent: '#787c7e',
    empty: '#ffffff',
  }[status];

  return (
    <div 
      style={{
        width: '50px',
        height: '50px',
        border: '2px solid #d3d6da',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '2rem',
        fontWeight: 'bold',
        backgroundColor,
        color: status === 'empty' ? 'black' : 'white',
      }}
    >
      {char}
    </div>
  );
};

type GuessProps = {
  guess: string;
  statuses: TileProps['status'][];
};

const Guess: FC<GuessProps> = ({ guess, statuses }) => {
  const tiles = [];
  for (let i = 0; i < WORD_LENGTH; i++) {
    const char = guess[i] ?? '';
    const status = statuses[i] ?? 'empty';
    tiles.push(
      <Tile key={`${guess}-${i}`} char={char} status={status} />
    );
  }
  return <div style={{ display: 'flex', gap: '5px' }}>{tiles}</div>;
};

type GameProps = {
  gameId: string;
}
const Game: FC<GameProps> = ({ gameId }) => {
  const { mutateAsync: makeGuess } = api.game.guess.useMutation();
  const [guesses, setGuesses] = useState<Array<{ guess: string; statuses: TileProps['status'][] }>>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [gameOver, setGameOver] = useState<boolean>(false);

  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameRef.current) {
      gameRef.current.focus();
    }
  }, []);

  const handleKeyDown = async(event: React.KeyboardEvent) => {
    if (gameOver) return;

    if (event.key === 'Enter' && currentGuess.length === WORD_LENGTH) {
      try {
        const { 
          isGameOver, 
          numberOfGuesses, 
          isGuessCorrect,
          statuses
        } = await makeGuess({ 
          guess: currentGuess,
          gameId,
        });

        setGuesses([...guesses, { guess: currentGuess, statuses }]);
        setCurrentGuess('');

        if (isGameOver || numberOfGuesses === MAX_GUESSES) {
          setGameOver(true);
        }
      } catch (error) {
        console.error('Error making guess:', error);
        alert("An error occurred. Please try again.");
      }
    } else if (event.key === 'Backspace') {
      setCurrentGuess(currentGuess.slice(0, -1));
    } else if (currentGuess.length < WORD_LENGTH && event.key.match(/^[a-zA-Z]$/)) {
      setCurrentGuess(currentGuess + event.key.toUpperCase());
    }
  };

  return (
    <div 
      className="game ring-o outline-0" 
      onKeyDown={handleKeyDown} 
      tabIndex={0} 
      ref={gameRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div 
        className="board"
        style={{
          display: 'grid',
          gridTemplateRows: `repeat(${MAX_GUESSES}, 1fr)`,
          gap: '5px',
          marginBottom: '20px',
        }}
      >
        {guesses.map(({ guess, statuses }, i) => (
          <Guess key={`guess-${i}`} guess={guess} statuses={statuses} />
        ))}
        {!gameOver && (
          <Guess key="current-guess" guess={currentGuess} statuses={Array(WORD_LENGTH).fill('empty')} />
        )}
        {Array(Math.max(0, MAX_GUESSES - guesses.length - (gameOver ? 0 : 1)))
          .fill('')
          .map((_, i) => (
            <Guess key={`empty-${i}`} guess="" statuses={Array(WORD_LENGTH).fill('empty')} />
          ))
        }
      </div>
      {gameOver && (
        <div className="game-over flex flex-col items-center gap-2">
          {guesses[guesses.length - 1]?.statuses.every(status => status === 'correct') 
            ? 'You won!' 
            : 'Game over!'}
          <CreateGame btnLabel="Play Again" />
        </div>
      )}
    </div>
  );
};

export default Game;
