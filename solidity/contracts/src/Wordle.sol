pragma solidity ^0.8.26;

contract Wordle {
    address public admin;

    mapping(uint256 => address[]) public winners;
    mapping(uint256 => mapping(address => uint256)) public guessCount;
    
    event WinnerRecorded(uint256 indexed gameDay, address winner, uint256 guessCount);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    function setAdmin(address newAdmin) public onlyAdmin {
        require(newAdmin != address(0), "Invalid address");
        admin = newAdmin;
    }

    function recordWinner(uint256 _gameId, address _winner, uint256 _guessCount) public onlyAdmin {
        require(_guessCount > 0 && _guessCount <= 6, "Invalid guess count");

        winners[_gameId].push(_winner);
        guessCount[_gameId][_winner] = _guessCount;
        emit WinnerRecorded(_gameId, _winner, _guessCount);
    }

    function getGameResult(uint256 gameId) public view returns (address[] memory, uint256[] memory) {
        address[] memory gameWinners = winners[gameId];
        uint256[] memory guessCounts = new uint256[](gameWinners.length);

        for (uint256 i = 0; i < gameWinners.length; i++) {
            guessCounts[i] = guessCount[gameId][gameWinners[i]];
        }

        return (gameWinners, guessCounts);
    }
}