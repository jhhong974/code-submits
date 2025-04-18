// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./ERC5192Lock.sol"; // Soul Bound Module
import "./ERC5484BurnAuth.sol"; // Soul Bound burn authorization

contract SBT is ERC5192Lock, ERC5484BurnAuth, ERC721Enumerable, ERC721URIStorage {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    address private immutable SBTMinter;

    constructor(string memory _name, string memory _symbol, address _SBTMinterContract) ERC5192Lock(_name, _symbol, true /* true(Lock 활성) || false(Lock 비활성) */ ) {
        SBTMinter = _SBTMinterContract;
    }

    modifier OnlySBTMinter() {
        require(msg.sender == SBTMinter, "Only SBTMinter can Call");
        _;
    }

    modifier checkAuth(uint256 tokenId) {
        BurnAuth _butnauth = auth[tokenId];
        if (_butnauth == BurnAuth.IssuerOnly) {
            require(msg.sender == SBTMinter, "ERC5484 : Only Issuer can burn SBT");
        } else if (_butnauth == BurnAuth.OwnerOnly) {
            require(msg.sender == _ownerOf(tokenId), "ERC5484 : Only Token owner can burn SBT");
        } else if (_butnauth == BurnAuth.Both) {
            require(
                msg.sender == _ownerOf(tokenId) || msg.sender == SBTMinter,
                "ERC5484 : Only Token owner and Issuer can burn SBT"
            );
        } else if (_butnauth == BurnAuth.Neither) {
            revert("ERC5484 : Cant burn SBT");
        }
        _;
    }

    function safeMint(address to, string memory uri) external OnlySBTMinter {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        _setAuth(msg.sender, to, tokenId, BurnAuth.Neither);
    }

    function setTokenURI(uint256 _tokenId, string calldata _tokenURI) external OnlySBTMinter {
        _setTokenURI(_tokenId, _tokenURI);
    }

    function burn(uint256 tokenId) external checkAuth(tokenId) {
        _burn(tokenId);
    }

    // The following functions are overrides required by Solidity.
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data)
        public
        override(ERC721, IERC721)
        checkLock
    {
        super.safeTransferFrom(from, to, tokenId, data);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) public override(ERC721, IERC721) checkLock {
        super.safeTransferFrom(from, to, tokenId);
    }

    function transferFrom(address from, address to, uint256 tokenId) public override(ERC721, IERC721) checkLock {
        super.transferFrom(from, to, tokenId);
    }

    function approve(address approved, uint256 tokenId) public override(ERC721, IERC721) checkLock {
        super.approve(approved, tokenId);
    }

    function setApprovalForAll(address operator, bool approved) public override(ERC721, IERC721) checkLock {
        super.setApprovalForAll(operator, approved);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    ///@dev required by the OZ ERC721Enumerable module
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
}
