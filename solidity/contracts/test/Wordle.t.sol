// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.26;

import {Wordle} from "../src/Wordle.sol";
import {Test} from "forge-std/Test.sol";

contract WordleGameTest is Test {
    Wordle public wordleGame;

    function setUp() public {
        wordleGame = new Wordle();
    }

    function testRecordWinner() public {
        string memory gameId = "game1";
        address winner = address(0x1234);
        uint256 guessCount = 4;

        wordleGame.recordWinner(gameId, winner, guessCount);

        (address[] memory winners, uint256[] memory guessCounts) = wordleGame.getGameResult(gameId);
        assertEq(winners.length, 1);
        assertEq(winners[0], winner);
        assertEq(guessCounts[0], guessCount);
    }

    function testRecordMultipleWinners() public {
        string memory gameId = "game2";
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

    function testGetNonExistentGameResult() public view {
        string memory nonExistentGameId = "nonexistent";

        (address[] memory winners, uint256[] memory guessCounts) = wordleGame.getGameResult(nonExistentGameId);
        assertEq(winners.length, 0);
        assertEq(guessCounts.length, 0);
    }

    function testRecordWinnerForMultipleGames() public {
        string memory gameId1 = "game3";
        string memory gameId2 = "game4";
        address winner1 = address(0x1234);
        address winner2 = address(0x5678);
        uint256 guessCount1 = 2;
        uint256 guessCount2 = 6;

        wordleGame.recordWinner(gameId1, winner1, guessCount1);
        wordleGame.recordWinner(gameId2, winner2, guessCount2);

        (address[] memory winners1, uint256[] memory guessCounts1) = wordleGame.getGameResult(gameId1);
        assertEq(winners1.length, 1);
        assertEq(winners1[0], winner1);
        assertEq(guessCounts1[0], guessCount1);

        (address[] memory winners2, uint256[] memory guessCounts2) = wordleGame.getGameResult(gameId2);
        assertEq(winners2.length, 1);
        assertEq(winners2[0], winner2);
        assertEq(guessCounts2[0], guessCount2);
    }
}
