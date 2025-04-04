// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAsset.sol";

// Extended interface for LSP8 with mint and setData
interface ILSP8Mintable {
    function mint(
        address to,
        bytes32 tokenId,
        bool allowNonLSP8Recipient,
        bytes calldata data
    ) external;
    function setData(
        bytes32 tokenId,
        bytes32 dataKey,
        bytes calldata dataValue
    ) external;
}

contract ButtonGame {
    // Ownership
    address public owner;
    bool public ownershipRenounced;

    // Configurable parameters
    uint256 public entryFee = 0.1 ether; // 0.1 LYX
    uint256 public countdownDuration = 3 minutes; // 3 minutes
    uint256 public winnerShare = 70; // 70%
    uint256 public charityShare = 10; // 10%
    uint256 public devShare = 10; // 10%
    uint256 public potReserveShare = 10; // 10%
    address public charity;

    // Game state
    uint256 public gameEndTime;
    address public lastPresser;
    uint256 public potBalance;
    bool public gameActive;

    // NFT tracking
    ILSP8Mintable public buttonBadge; // Use extended interface
    mapping(address => bytes32) public pressBadgeId;
    mapping(address => bytes32) public streakBadgeId;
    mapping(address => bytes32) public rareBadgeId;
    mapping(address => uint256) public pressCount;
    mapping(address => uint256) public streakCount;
    mapping(address => uint256) public lastPressTime;
    uint256 public uniquePressers;

    // Events
    event ButtonPressed(address indexed presser, uint256 timestamp);
    event GameEnded(address indexed winner, uint256 amountWon);
    event BadgeMinted(address indexed player, bytes32 tokenId);
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

    constructor(
        address _owner,
        address _charity,
        address payable _buttonBadge
    ) {
        owner = _owner;
        charity = _charity;
        buttonBadge = ILSP8Mintable(_buttonBadge);
        gameActive = true;
        gameEndTime = block.timestamp + countdownDuration;
    }

    function pressButton() external payable {
        require(gameActive, "Game not active");
        require(msg.value == entryFee, "Incorrect entry fee");

        // If timer expired and there was a previous presser, distribute winnings
        if (block.timestamp >= gameEndTime && lastPresser != address(0)) {
            _distributeWinnings(lastPresser);
        }

        // Update game state
        lastPresser = msg.sender;
        gameEndTime = block.timestamp + countdownDuration;
        potBalance += msg.value;

        _updatePressBadge(msg.sender);
        _updateStreak(msg.sender);
        _checkRareBadge(msg.sender);

        emit ButtonPressed(msg.sender, block.timestamp);
    }

    // NFT Functions
    function _updatePressBadge(address player) internal {
        if (pressBadgeId[player] == bytes32(0)) {
            uniquePressers++;
            bytes32 tokenId = keccak256(
                abi.encodePacked(player, "PRESS", block.timestamp)
            );
            pressBadgeId[player] = tokenId;
            buttonBadge.mint(
                player,
                tokenId,
                true,
                abi.encodePacked("Presses: 1")
            );
            emit BadgeMinted(player, tokenId);
        }
        pressCount[player]++;
        buttonBadge.setData(
            pressBadgeId[player],
            keccak256("PressCount"),
            abi.encodePacked(pressCount[player])
        );
    }

    function _updateStreak(address player) internal {
        if (streakBadgeId[player] == bytes32(0)) {
            bytes32 tokenId = keccak256(
                abi.encodePacked(player, "STREAK", block.timestamp)
            );
            streakBadgeId[player] = tokenId;
            buttonBadge.mint(
                player,
                tokenId,
                true,
                abi.encodePacked("Streak: 1")
            );
            emit BadgeMinted(player, tokenId);
        }
        if (block.timestamp - lastPressTime[player] <= 24 hours) {
            streakCount[player]++;
        } else {
            streakCount[player] = 1;
        }
        lastPressTime[player] = block.timestamp;
        buttonBadge.setData(
            streakBadgeId[player],
            keccak256("StreakCount"),
            abi.encodePacked(streakCount[player])
        );
    }

    function _checkRareBadge(address player) internal {
        if (uniquePressers <= 100 && rareBadgeId[player] == bytes32(0)) {
            bytes32 tokenId = keccak256(
                abi.encodePacked("First100_", uniquePressers)
            );
            rareBadgeId[player] = tokenId;
            buttonBadge.mint(
                player,
                tokenId,
                true,
                abi.encodePacked("First 100 Pressers #", uniquePressers)
            );
            emit BadgeMinted(player, tokenId);
        }
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

        payable(winner).transfer(winnerAmount);
        payable(charity).transfer(charityAmount);
        payable(owner).transfer(devAmount);
        potBalance += reserveAmount;

        bytes32 winnerTokenId = keccak256(
            abi.encodePacked("Winner_", block.timestamp)
        );
        buttonBadge.mint(
            winner,
            winnerTokenId,
            true,
            abi.encodePacked("Last Press Hero")
        );
        emit BadgeMinted(winner, winnerTokenId);

        emit GameEnded(winner, winnerAmount);
    }

    // Owner configuration
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

    function getGameState()
        external
        view
        returns (uint256, address, uint256, bool)
    {
        return (gameEndTime, lastPresser, potBalance, gameActive);
    }

    receive() external payable {}
}
