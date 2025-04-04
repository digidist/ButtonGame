// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract ButtonGame {
    // Ownership
    address public owner;
    bool public ownershipRenounced;

    // Configurable parameters
    uint256 public entryFee = 0.1 ether;
    uint256 public countdownDuration = 3 minutes;
    uint256 public winnerShare = 70;
    uint256 public charityShare = 10;
    uint256 public devShare = 10;
    uint256 public potReserveShare = 10;
    address public charity;

    // Game state
    uint256 public gameEndTime;
    address public lastPresser;
    uint256 public potBalance;
    bool public gameActive;
    uint256 public lastPressTime;

    // Winner tracking
    address public lastWinner;
    uint256 public lastPrize;
    uint256 public lastWinTime;

    // Events
    event ButtonPressed(address indexed presser, uint256 timestamp);
    event GameEnded(address indexed winner, uint256 amountWon);
    event OwnershipTransferred(
        address indexed oldOwner,
        address indexed newOwner
    );
    event OwnershipRenounced(address indexed oldOwner);
    event ConfigUpdated(string param, uint256 value);

    modifier onlyOwner() {
        require(
            msg.sender == owner && !ownershipRenounced,
            "Not owner or ownership renounced"
        );
        _;
    }

    constructor(address _owner, address _charity) {
        owner = _owner;
        charity = _charity;
        gameActive = true;
        gameEndTime = block.timestamp + countdownDuration;
    }

    function pressButton() external payable {
        require(gameActive, "Game not active");
        require(msg.value == entryFee, "Incorrect entry fee");

        if (block.timestamp >= gameEndTime && lastPresser != address(0)) {
            _distributeWinnings(lastPresser);
        }

        lastPresser = msg.sender;
        gameEndTime = block.timestamp + countdownDuration;
        potBalance += msg.value;
        lastPressTime = block.timestamp;

        emit ButtonPressed(msg.sender, block.timestamp);
    }

    function _distributeWinnings(address winner) internal {
        uint256 totalPot = potBalance;
        potBalance = 0;

        uint256 winnerAmount = (totalPot * winnerShare) / 100;
        uint256 charityAmount = (totalPot * charityShare) / 100;
        uint256 devAmount = (totalPot * devShare) / 100;
        uint256 reserveAmount = (totalPot * potReserveShare) / 100;

        require(
            winnerShare + charityShare + devShare + potReserveShare == 100,
            "Shares must sum to 100"
        );

        (bool success1, ) = payable(winner).call{value: winnerAmount}("");
        require(success1, "Winner transfer failed");
        (bool success2, ) = payable(charity).call{value: charityAmount}("");
        require(success2, "Charity transfer failed");
        (bool success3, ) = payable(owner).call{value: devAmount}("");
        require(success3, "Dev transfer failed");

        potBalance += reserveAmount;

        lastWinner = winner;
        lastPrize = winnerAmount;
        lastWinTime = block.timestamp;

        emit GameEnded(winner, winnerAmount);
    }

    // Consolidated view function
    function getAllGameData()
        external
        view
        returns (
            uint256 _gameEndTime,
            address _lastPresser,
            uint256 _potBalance,
            bool _gameActive,
            uint256 _lastPressTime,
            address _lastWinner,
            uint256 _lastPrize,
            uint256 _lastWinTime
        )
    {
        return (
            gameEndTime,
            lastPresser,
            potBalance,
            gameActive,
            lastPressTime,
            lastWinner,
            lastPrize,
            lastWinTime
        );
    }

    // Owner configuration functions
    function updateEntryFee(uint256 _entryFee) external onlyOwner {
        entryFee = _entryFee;
        emit ConfigUpdated("EntryFee", _entryFee);
    }

    function updateCountdownDuration(uint256 _duration) external onlyOwner {
        countdownDuration = _duration;
        emit ConfigUpdated("CountdownDuration", _duration);
    }

    function updateShares(
        uint256 _winner,
        uint256 _charity,
        uint256 _dev,
        uint256 _reserve
    ) external onlyOwner {
        require(
            _winner + _charity + _dev + _reserve == 100,
            "Shares must sum to 100"
        );
        winnerShare = _winner;
        charityShare = _charity;
        devShare = _dev;
        potReserveShare = _reserve;
        emit ConfigUpdated("SharesUpdated", _winner);
    }

    function updateCharity(address _charity) external onlyOwner {
        charity = _charity;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function renounceOwnership() external onlyOwner {
        emit OwnershipRenounced(owner);
        ownershipRenounced = true;
    }

    receive() external payable {}
}
