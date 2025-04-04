// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/presets/LSP8Mintable.sol";
import "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/LSP8Constants.sol";
import "@lukso/lsp-smart-contracts/contracts/LSP4DigitalAssetMetadata/LSP4Constants.sol";

contract ButtonBadge is LSP8Mintable {
    // Game contract address which is allowed to mint and update data
    address public gameContract;

    constructor(
        string memory dynamicNFTCollectionName,
        string memory dynamicNFTCollectionSymbol,
        address contractOwner
    )
        LSP8Mintable(
            dynamicNFTCollectionName,
            dynamicNFTCollectionSymbol,
            contractOwner,
            _LSP4_TOKEN_TYPE_COLLECTION,
            _LSP8_TOKENID_FORMAT_ADDRESS
        )
    {}

    modifier onlyGame() {
        require(msg.sender == gameContract, "Only game contract can call");
        _;
    }

    function mint(
        address to,
        bytes32 tokenId,
        bool allowNonLSP8Recipient,
        bytes memory data
    ) public override onlyGame {
        _mint(to, tokenId, allowNonLSP8Recipient, data);
    }

    // Implements setData as per ILSP8Mintable
    function setData(
        bytes32 tokenId,
        bytes32 dataKey,
        bytes calldata dataValue
    ) external onlyGame {
        // Ensure token exists
        require(_tokenOwners[tokenId] != address(0), "Token does not exist");
        // Use a composite key for token-specific data
        _setData(keccak256(abi.encodePacked(tokenId, dataKey)), dataValue);
    }

    function setGameContract(address _gameContract) external onlyOwner {
        gameContract = _gameContract;
    }
}
