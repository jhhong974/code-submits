// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "./interface/IOrder.sol";
import "./interface/IOrderRules.sol";

contract DKA is ERC20Permit, ERC2771Context {
    address _orderRules;

    bytes32 private constant _PERMIT_TYPEHASH =
        keccak256("permitLodis(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");

    constructor(address forwarder, address orderRules)
        ERC2771Context(forwarder)
        ERC20("dKargo", "DKA")
        ERC20Permit("dKargo")
    {
        _orderRules = orderRules;
        _mint(msg.sender, 1000000000 * 10 ** decimals());
    }

    function permitLodis(
        uint256 orderId,
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        bytes memory signature
    ) public {
        require(msg.sender == IOrderRules(_orderRules).getOrderAddress());
        require(block.timestamp <= deadline, "ERC20Permit: expired deadline");

        bytes32 structHash =
            keccak256(abi.encode(_PERMIT_TYPEHASH, owner, spender, value, getNonce(orderId, owner), deadline));

        bytes32 hashdata = keccak256(abi.encodePacked("\x19\x01", _domainSeparatorV4(), structHash));

        (address signer,) = ECDSA.tryRecover(hashdata, signature);

        require(signer == owner, "ERC20Permit: invalid signature");

        _approve(owner, spender, value);
    }

    function getNonce(uint256 orderId, address owner) public view returns (uint256) {
        return IOrder(IOrderRules(_orderRules).getOrderAddress()).getNonce(orderId, owner);
    }

    function _msgSender() internal view virtual override(Context, ERC2771Context) returns (address sender) {
        if (isTrustedForwarder(msg.sender)) {
            assembly {
                sender := shr(96, calldataload(sub(calldatasize(), 20)))
            }
        } else {
            return super._msgSender();
        }
    }

    function _msgData() internal view virtual override(Context, ERC2771Context) returns (bytes calldata) {
        if (isTrustedForwarder(msg.sender)) {
            return msg.data[:msg.data.length - 20];
        } else {
            return super._msgData();
        }
    }

    // AFTER Hack Thridweb
    function _contextSuffixLength() internal view virtual override(Context, ERC2771Context) returns (uint256) {
        return 20;
    }
}
