/* eslint-disable @typescript-eslint/prefer-regexp-exec */
import type { FC } from 'react';
import React, { useEffect, useRef, useState } from 'react';

import { validWords } from '~/constants/words';

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
  answer: string;
  isCurrentGuess: boolean;
};

const Guess: FC<GuessProps> = ({ guess, answer, isCurrentGuess }) => {
  const tiles = [];
  for (let i = 0; i < WORD_LENGTH; i++) {
    const char = guess[i] ?? '';
    let status: TileProps['status'] = 'empty';
    if (!isCurrentGuess && char) {
      if (char === answer[i]) {
        status = 'correct';
      } else if (answer.includes(char)) {
        status = 'present';
      } else {
        status = 'absent';
      }
    }
    tiles.push(
      <Tile key={`${guess}-${i}`} char={char} status={status} />
    );
  }
  return <div style={{ display: 'flex', gap: '5px' }}>{tiles}</div>;
};

const Game: FC = () => {
  const [answer, setAnswer] = useState<string>('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [gameOver, setGameOver] = useState<boolean>(false);

  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {    
    // set the answer to a random valid word 
    const validWordsArray = Array.from(validWords.entries());
    const randomIndex = Math.floor(Math.random() * validWordsArray.length);
    setAnswer(validWordsArray[randomIndex]![0].toUpperCase());

    // Focus the game div when component mounts
    if (gameRef.current) {
      gameRef.current.focus();
    }
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (gameOver) return;

    if (event.key === 'Enter' && currentGuess.length === WORD_LENGTH) {
      if (!validWords.has(currentGuess.toLowerCase())) {
        alert("not a word");
        return;
      }
      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);
      setCurrentGuess('');

      if (currentGuess === answer) {
        setGameOver(true);
      } else if (newGuesses.length === MAX_GUESSES) {
        setGameOver(true);
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
        {guesses.map((guess, i) => (
          <Guess key={`guess-${i}`} guess={guess} answer={answer} isCurrentGuess={false} />
        ))}
        {!gameOver && (
          <Guess key="current-guess" guess={currentGuess} answer={answer} isCurrentGuess={true} />
        )}
        {Array(MAX_GUESSES - guesses.length - 1)
          .fill('')
          .map((_, i) => (
            <Guess key={`empty-${i}`} guess="" answer={answer} isCurrentGuess={false} />
          ))}
      </div>
      {gameOver && (
        <div className="game-over">
          {guesses.includes(answer) ? 'You won!' : `Game over! The word was ${answer}`}
        </div>
      )}
    </div>
  );
};

export default Game;
