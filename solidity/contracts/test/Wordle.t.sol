// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.26;

import {WordleGame} from "../src/Wordle.sol";
import {Test} from "forge-std/Test.sol";

contract WordleGameTest is Test {
    WordleGame public wordleGame;

    function setUp() public {
        wordleGame = new WordleGame();
    }

    function testRecordWinner() public {
        uint256 gameId = 1;
        address winner = address(0x1234);
        uint256 guessCount = 4;

        wordleGame.recordWinner(gameId, winner, guessCount);

        (address[] memory winners, uint256[] memory guessCounts) = wordleGame.getGameResult(gameId);
        assertEq(winners.length, 1);
        assertEq(winners[0], winner);
        assertEq(guessCounts[0], guessCount);
    }

    function testRecordMultipleWinners() public {
        uint256 gameId = 2;
        address winner1 = address(0x1234);
        address winner2 = address(0x5678);
        uint256 guessCount1 = 3;
        uint256 guessCount2 = 5;

        wordleGame.recordWinner(gameId, winner1, guessCount1);
        wordleGame.recordWinner(gameId, winner2, guessCount2);

        (address[] memory winners, uint256[] memory guessCounts) = wordleGame.getGameResult(gameId);
        assertEq(winners.length, 2);
        assertEq(winners[0], winner1);
        assertEq(winners[1], winner2);
        assertEq(guessCounts[0], guessCount1);
        assertEq(guessCounts[1], guessCount2);
    }
}
