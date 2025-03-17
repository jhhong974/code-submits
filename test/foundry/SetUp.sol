// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import {Order} from "../../contracts/Order.sol";
import {OrderRules} from "../../contracts/OrderRules.sol";
import {TxForwarder} from "../../contracts/TxForwarder.sol";
import {SBTMinter} from "../../contracts/SBTMinter.sol";
import {SBT} from "../../contracts/SBT/SBT.sol";
import {DKA} from "../../contracts/DKA.sol";
import {Treasury} from "../../contracts/Treasury.sol";
import {ERC1967Proxy} from "../../contracts/Proxy.sol";

import {Test} from "forge-std/Test.sol";

abstract contract SetUp is Test {
    TxForwarder _TxForwarder;
    OrderRules _OrderRules;
    Order _Order;
    SBTMinter _SBTMinter;
    SBT _ShipperSBT;
    SBT _CarrierSBT;
    DKA _DKA;
    Treasury _Treasury;

    /**
     * ---------------------------- 📝 Environment Data ----------------------------
     */

    address shipper = 0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF; // pk 2
    address carrier = 0x6813Eb9362372EEF6200f3b1dbC3f819671cBA69; // pk 3

    uint256 shipperPK = 2; // pk 3
    uint256 carrierPK = 3; // pk 3

    uint256 constant shipperBalance = 2000 ether; // DKA
    uint256 constant carrierBalance = 2000 ether; // DKA

    string shipper0SBTUri = "Shipper 0 Tier SBT URI";
    string carrier0SBTUri = "carrier 0 Tier SBT URI";

    uint256 orderId;
    bytes32 departure = bytes32("departure");
    bytes32 destination = bytes32("destination");
    bytes32 packageWeight = bytes32("packageWeight");
    uint256 price;
    uint256 reward;
    uint256 collateral;
    uint256 failDate;
    uint256 pickupDate;
    uint256 expiredDate;
    Order.shippingState shipState;
    bool isDirect;
    bool ispickupContact;
    bool iscompleteContact;
    uint256 treasuryFee;
    uint256 shipperFee;
    uint256 carrierFee;

    /**
     * ----------------------------- 📝 Verify Function -----------------------------
     */
    event Transfer(address indexed from, address indexed to, uint256 amountOrTokenId);
    event Approval(address indexed owner, address indexed spender, uint256 amountOrTokenId);
    event MetadataUpdate(uint256 _tokenId);

    event orderCreated(uint256 orderId, Order.shippingState state);
    event orderMatched(uint256 orderId, Order.shippingState state);
    event carrierpickUp(uint256 orderId, Order.shippingState state);
    event orderCompleted(uint256 orderId, Order.shippingState state);
    event orderCanceled(uint256 orderId, Order.shippingState state);
    event orderFailed(uint256 orderId, Order.shippingState state);

    function CheckOrderEvent(uint256 _orderId, Order.shippingState state) internal {
        if (Order.shippingState.ORDER_REGISTERED == state) emit orderCreated(_orderId, state);
        if (Order.shippingState.FINALIZED_CARRIER == state) emit orderMatched(_orderId, state);
        if (
            Order.shippingState.DELIVERY_CANCEL == state || Order.shippingState.DELIVERY_CANCEL_SHIPPER == state
                || Order.shippingState.DELIVERY_CANCEL_CARRIER == state || Order.shippingState.CARRIER_PICKUP_DELAY == state
        ) emit orderCanceled(_orderId, state);
        if (Order.shippingState.CARRIER_PICKUP == state) emit carrierpickUp(_orderId, state);
        if (Order.shippingState.DELIVERY_COMPLETE == state) emit orderCompleted(_orderId, state);
        if (Order.shippingState.DELIVERY_EXPIRED == state) emit orderFailed(_orderId, state);
    }

    function CheckSelectOrderEvent(
        uint256 _orderId,
        address _carrier,
        address _shipper,
        uint256 _reward,
        uint256 _collateral
    ) internal {
        CheckOrderEvent(_orderId, Order.shippingState.FINALIZED_CARRIER);
        CheckApprovalEvent(_carrier, address(_Order), _collateral);
        CheckApprovalEvent(_carrier, address(_Order), 0);
        CheckTransferEvent(_carrier, address(_Order), _collateral);
        CheckApprovalEvent(_shipper, address(_Order), _reward);
        CheckApprovalEvent(_shipper, address(_Order), 0);
        CheckTransferEvent(_shipper, address(_Order), _reward);
    }

    function CheckCompleteOrderEvent(
        uint256 _orderId,
        address _carrier,
        address _shipper,
        uint256 _reward,
        uint256 _collateral
    ) internal {
        uint256 platformFee = _reward * _OrderRules.getPlatformFee() / 10 ** (5 + 2);
        CheckOrderEvent(_orderId, Order.shippingState.DELIVERY_COMPLETE);
        CheckTransferEvent(address(_Order), address(_Treasury), platformFee);
        CheckTransferEvent(address(_Order), _carrier, _reward + _collateral - platformFee);

        if (_ShipperSBT.balanceOf(_shipper) == 0) {
            uint256 tokenId = _ShipperSBT.totalSupply();
            CheckTransferEvent(address(0), _shipper, tokenId);
            emit MetadataUpdate(tokenId);
        }
        if (_CarrierSBT.balanceOf(_carrier) == 0) {
            uint256 tokenId = _CarrierSBT.totalSupply();
            CheckTransferEvent(address(0), _carrier, 0);
            emit MetadataUpdate(tokenId);
        }
    }

    function CheckCancelOrderBeforePickupEvent(uint256 _orderId, address _caller) internal {
        Order.order memory data = _Order.getOrder(_orderId);
        uint256 platformFee = data._reward * data.treasuryFee / 10 ** (5 + 2);
        if (_caller == data._shipper) {
            CheckOrderEvent(_orderId, Order.shippingState.DELIVERY_CANCEL_SHIPPER);
            uint256 _shipperFee = data._reward * data.shipperFee / 100;
            CheckTransferEvent(address(_Order), data._carrier, data._collateral + _shipperFee);
            CheckTransferEvent(address(_Order), data._carrier, data._reward - _shipperFee - platformFee);
            CheckTransferEvent(address(_Order), address(_Treasury), platformFee);
        } else if (_caller == data._carrier) {
            CheckOrderEvent(_orderId, Order.shippingState.DELIVERY_CANCEL_CARRIER);
            uint256 _carrierFee = data._collateral * data.carrierFee / 100;
            CheckTransferEvent(address(_Order), data._shipper, data._reward + carrierFee);
            if (data._collateral - _carrierFee < platformFee) {
                CheckTransferEvent(address(_Order), address(_Treasury), data._collateral - _carrierFee);
            } else {
                CheckTransferEvent(address(_Order), data._carrier, data._collateral - _carrierFee - platformFee);
                CheckTransferEvent(address(_Order), address(_Treasury), platformFee);
            }
        }
    }

    function CheckDelayPickupEvent(uint256 _orderId) internal {
        Order.order memory data = _Order.getOrder(_orderId);
        uint256 platformFee = data._reward * data.treasuryFee / 10 ** (5 + 2);
        uint256 _carrierFee = data._collateral * data.carrierFee / 100;
        CheckOrderEvent(_orderId, Order.shippingState.CARRIER_PICKUP_DELAY);
        CheckTransferEvent(address(_Order), data._shipper, data._reward + _carrierFee);
        if (data._collateral - _carrierFee < platformFee) {
            CheckTransferEvent(address(_Order), address(_Treasury), data._collateral - _carrierFee);
        } else {
            CheckTransferEvent(address(_Order), data._carrier, data._collateral - _carrierFee - platformFee);
            CheckTransferEvent(address(_Order), address(_Treasury), platformFee);
        }
    }

    function CheckExpiredOrderEvent(uint256 _orderId) internal {
        Order.order memory data = _Order.getOrder(_orderId);
        CheckOrderEvent(_orderId, Order.shippingState.DELIVERY_EXPIRED);
        uint256 escrowAmount = data._reward + data._collateral;
        uint256 platformFee = data._reward * data.treasuryFee / 10 ** (5 + 2);

        CheckTransferEvent(address(_Order), address(_Treasury), platformFee);
        CheckTransferEvent(address(_Order), data._shipper, escrowAmount - platformFee);
    }

    function CheckTransferEvent(address from, address to, uint256 amountOrTokenId) internal {
        emit Transfer(from, to, amountOrTokenId);
    }

    function CheckApprovalEvent(address from, address to, uint256 amountOrTokenId) internal {
        emit Approval(from, to, amountOrTokenId);
    }

    function CheckShipperSBT(address owner, string memory tokenURI) internal {
        uint256 tokenId = _ShipperSBT.tokenOfOwnerByIndex(owner, 0);
        string memory currentURI = _ShipperSBT.tokenURI(tokenId);
        assertEq(currentURI, tokenURI, "Unexpected Shipper token URI");
    }

    function CheckCarrierrSBT(address owner, string memory tokenURI) internal {
        uint256 tokenId = _CarrierSBT.tokenOfOwnerByIndex(owner, 0);
        string memory currentURI = _CarrierSBT.tokenURI(tokenId);
        assertEq(currentURI, tokenURI, "Unexpected Carrier token URI");
    }

    function CheckResult() internal {
        Order.order memory data = _Order.getOrder(orderId);

        assertEq(data._orderId, orderId, "OrderId");
        assertEq(data._shipper, shipper, "Shipper");
        if (
            Order.shippingState.ORDER_REGISTERED == data._shipState
                || Order.shippingState.DELIVERY_CANCEL == data._shipState
        ) {
            assertEq(data._carrier, address(0), "Carrier");
            assertEq(data._reward, 0, "Reward");
        } else {
            assertEq(data._carrier, carrier, "Carrier");
            assertEq(data._reward, reward, "Reward");
        }
        assertEq(data._departure, departure, "Departure");
        assertEq(data._destination, destination, "Destination");
        assertEq(data._packageWeight, packageWeight, "Weight");
        assertEq(data._price, price, "Price");
        assertEq(data._collateral, price / _OrderRules.getCollateralPercent(), "Collateral");

        if (expiredDate == 0) {
            assertEq(data.isDirect, true, "is Direct");
        } else {
            assertEq(data.isDirect, false, "is Direct");
        }

        // TIEM CHECK ZOME
        {
            assertEq(data._expiredDate, block.timestamp + _OrderRules.getTimeExpiredWaitMatching(), "ExpiredDate");
            if (
                Order.shippingState.ORDER_REGISTERED == data._shipState
                    || Order.shippingState.DELIVERY_CANCEL == data._shipState
            ) {
                // CreateOrder 단계
                if (expiredDate == 0) {
                    assertEq(data._pickupDate, 0, "[CreateOrder][Direct] PickupDate");
                    assertEq(data._failDate, 0, "[CreateOrder][Direct] FailDate");
                } else {
                    assertEq(
                        data._pickupDate,
                        expiredDate - _OrderRules.getTimeExpiredDelayedPick(),
                        "[CreateOrder][Specfic] PickupDate"
                    );
                    assertEq(data._failDate, expiredDate, "[CreateOrder][Specfic] FailDate");
                }
            } else {
                if (expiredDate == 0) {
                    assertEq(
                        data._pickupDate,
                        block.timestamp + _OrderRules.getTimeExpiredDelayedPick(),
                        "[Direct] PickupDate"
                    );
                    assertEq(
                        data._failDate, block.timestamp + _OrderRules.getTimeExpiredDeliveryFault(), "[Direct] FailDate"
                    );
                } else {
                    assertEq(
                        data._pickupDate, expiredDate - _OrderRules.getTimeExpiredDelayedPick(), "[Specfic] PickupDate"
                    );
                    assertEq(data._failDate, expiredDate, "[Specfic] FailDate");
                }
            }
        }
        // assertEq(data.ispickupContact, expact.ispickupContact,"is pickupContact");
        // assertEq(data.iscompleteContact, expact.iscompleteContact,"is completeContact");
    }

    /**
     * ----------------------------- 📝 CALL LODIST ORDER FUNCTION -----------------------------
     */

    function CREATE_ORDER(
        uint256 _orderId,
        address _shipper,
        bytes32 _departure,
        bytes32 _destination,
        bytes32 _packageWeight,
        uint256 _price,
        uint256 _expiredDate,
        bool _ispickupContact,
        bool _iscompleteContact,
        address caller,
        string memory ErrMSG
    ) internal {
        if (bytes(ErrMSG).length != 0) {
            vm.expectRevert(bytes(ErrMSG));
        } else {
            vm.expectEmit();
            CheckOrderEvent(_orderId, Order.shippingState.ORDER_REGISTERED);
        }
        vm.prank(caller);
        _Order.createOrder(
            _shipper,
            _departure,
            _destination,
            _packageWeight,
            _price,
            _expiredDate,
            _ispickupContact,
            _iscompleteContact,
            "extraData"
        );
    }

    function SELECT_ORDER(
        uint256 _orderId,
        Order.OrderSigData memory carrierOrderData,
        uint256 orderDataPK,
        Order.PermitSigData memory carrierPermitData,
        uint256 carrierPermitDataPK,
        Order.PermitSigData memory shipperPermitData,
        uint256 shipperPermitDataPK,
        address caller,
        string memory ErrMSG
    ) internal {
        bytes memory carrierOrderSig = getOrderSignature(carrierOrderData, orderDataPK);
        bytes memory carrierCollateralSig = getPermitSignature(
            carrierPermitData.owner,
            carrierPermitData.spender,
            carrierPermitData.value,
            carrierPermitData.nonce,
            carrierPermitData.deadline,
            carrierPermitDataPK
        );
        bytes memory shipperRewardSig = getPermitSignature(
            shipperPermitData.owner,
            shipperPermitData.spender,
            shipperPermitData.value,
            shipperPermitData.nonce,
            shipperPermitData.deadline,
            shipperPermitDataPK
        );

        if (bytes(ErrMSG).length != 0) {
            vm.expectRevert(bytes(ErrMSG));
        } else {
            vm.expectEmit();
            CheckSelectOrderEvent(
                _orderId,
                carrierPermitData.owner,
                shipperPermitData.owner,
                shipperPermitData.value,
                carrierPermitData.value
            );
        }
        vm.prank(caller);
        _Order.selectOrder(
            _orderId,
            carrierOrderData,
            carrierOrderSig,
            carrierPermitData,
            carrierCollateralSig,
            shipperPermitData,
            shipperRewardSig
        );
    }

    function PICK_OREDR_WITHOUT_SIG(uint256 _orderId, address caller, string memory ErrMSG) internal {
        if (bytes(ErrMSG).length != 0) {
            vm.expectRevert(bytes(ErrMSG));
        } else {
            vm.expectEmit();
            CheckOrderEvent(_orderId, Order.shippingState.CARRIER_PICKUP);
        }
        vm.prank(caller);
        _Order.pickOrderWithOutSig(_orderId);
    }

    function COMPLETE_ORDER_WITHOUT_SIG(uint256 _orderId, address caller, string memory ErrMSG) internal {
        if (bytes(ErrMSG).length != 0) {
            vm.expectRevert(bytes(ErrMSG));
        } else {
            vm.expectEmit();
            CheckCompleteOrderEvent(orderId, carrier, shipper, reward, collateral);
        }
        vm.prank(caller);
        _Order.completeOrderWithOutSig(_orderId);
    }

    function CANCEL_ORDER_BEFORE_MATCH(uint256 _orderId, address _caller, string memory ErrMSG) internal {
        if (bytes(ErrMSG).length != 0) {
            vm.expectRevert(bytes(ErrMSG));
        } else {
            vm.expectEmit();
            CheckOrderEvent(_orderId, Order.shippingState.DELIVERY_CANCEL);
        }
        vm.prank(_caller);
        _Order.cancelOrderBeforeMatch(_orderId);
    }

    function CANCEL_ORDER_BEFORE_PICKUP(uint256 _orderId, address _caller, string memory ErrMSG) internal {
        if (bytes(ErrMSG).length != 0) {
            vm.expectRevert(bytes(ErrMSG));
        } else {
            vm.expectEmit();
            CheckCancelOrderBeforePickupEvent(_orderId, _caller);
        }
        vm.prank(_caller);
        _Order.cancelOrderBeforePickUp(_orderId);
    }

    function DELAY_PICKUP(uint256 _orderId, address caller, string memory ErrMSG) internal {
        if (bytes(ErrMSG).length != 0) {
            vm.expectRevert(bytes(ErrMSG));
        } else {
            vm.expectEmit();
            CheckDelayPickupEvent(_orderId);
        }
        vm.prank(caller);
        _Order.delayPickUp(_orderId);
    }

    function EXPIRED_ORDER(uint256 _orderId, address _caller, string memory ErrMSG) internal {
        if (bytes(ErrMSG).length != 0) {
            vm.expectRevert(bytes(ErrMSG));
        } else {
            vm.expectEmit();
            CheckExpiredOrderEvent(_orderId);
        }
        vm.prank(_caller);
        _Order.expiredOrder(_orderId);
    }

    function CREATE_DEME_ORDER(uint256 num) internal {
        uint256 j = orderId + 1;
        uint256 _shipperPK = 222;

        while (j < num) {
            CREATE_ORDER(
                j,
                vm.addr(_shipperPK),
                departure,
                destination,
                packageWeight,
                price,
                expiredDate,
                ispickupContact,
                iscompleteContact,
                vm.addr(_shipperPK),
                ""
            );
            j++;
        }
    }
    /**
     * ----------------------------- 📝 Function Module -----------------------------
     */

    struct sigVRS {
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    function getPermitSignature(
        address owner,
        address spender,
        uint256 assetAmount,
        uint256 nonce,
        uint256 deadline,
        uint256 pk
    ) internal view returns (bytes memory signature) {
        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                _DKA.DOMAIN_SEPARATOR(),
                keccak256(
                    abi.encode(
                        keccak256(
                            "permitLodis(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
                        ),
                        owner,
                        spender,
                        assetAmount,
                        nonce,
                        deadline
                    )
                )
            )
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(pk, digest);
        signature = concatSig(v, r, s);
    }

    function OrderHashStruct(Order.OrderSigData memory orderSigData) internal pure returns (bytes32) {
        return keccak256(
            abi.encode(
			    keccak256("OrderSigData(uint256 orderId,address shipper,address carrier,bytes32 departure,bytes32 destination,bytes32 packageWeight,uint256 packagePrice,uint256 reward,uint256 collateral,uint256 expiredDate,uint256 nonce)"),
			    orderSigData.orderId, 
				orderSigData.shipper, 
				orderSigData.carrier, 
				orderSigData.departure,
                orderSigData.destination,
                orderSigData.packageWeight,
                orderSigData.packagePrice,
				orderSigData.reward, 
				orderSigData.collateral, 
				orderSigData.expiredDate,
                orderSigData.nonce
		    )
        );
    }

    function getOrderSignature(Order.OrderSigData memory orderSigData, uint256 pk)
        internal
        view
        returns (bytes memory signature)
    {
        bytes32 digest =
            keccak256(abi.encodePacked("\x19\x01", _Order.DOMAIN_SEPARATOR(), OrderHashStruct(orderSigData)));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(pk, digest);
        signature = concatSig(v, r, s);
    }

    function concatSig(uint8 v, bytes32 r, bytes32 s) internal pure returns (bytes memory signature) {
        return abi.encodePacked(r, s, v);
    }

    /**
     * ------------------------------------------------------------------------------
     */

    function setUp() public {
        address implement;

        // Deploy TxForwarder
        _TxForwarder = new TxForwarder();

        // Deploy OrderRules
        implement = address(new OrderRules());
        _OrderRules = OrderRules(address(new ERC1967Proxy(address(implement),abi.encodeWithSignature("initialize()"))));

        // Deploy Order
        _Order = new Order(1,address(_OrderRules),address(_TxForwarder));

        // Deploy SBTMinter
        implement = address(new SBTMinter());
        _SBTMinter = SBTMinter(
            address(
                new ERC1967Proxy(address(implement),abi.encodeWithSignature("initialize(address)",address(_OrderRules)))
            )
        );

        // Deploy SBT
        _ShipperSBT = new SBT("LodisSbtSipper","LSS",address(_SBTMinter));
        _CarrierSBT = new SBT("LodisSbtCarrier","LSC",address(_SBTMinter));

        // transfer DKA to Shipper, Carrier
        _DKA = new DKA(address(_TxForwarder),address(_OrderRules));
        _DKA.transfer(address(shipper), shipperBalance);
        _DKA.transfer(address(carrier), carrierBalance);

        // Deploy Treasury
        implement = address(new Treasury());
        _Treasury = Treasury(
            address(new ERC1967Proxy(address(implement),abi.encodeWithSignature("initialize(address)",address(_DKA))))
        );

        _OrderRules.setDKATokenAddress(address(_DKA));
        _OrderRules.setOrderAddress(address(_Order));
        _OrderRules.setTreasuryAddress(address(_Treasury));
        _OrderRules.setSBTMinterAddress(address(_SBTMinter));
        _OrderRules.setShipperSBTAddress(address(_ShipperSBT));
        _OrderRules.setCarrierSBTAddress(address(_CarrierSBT));

        _SBTMinter.upgradeShipperRules(SBTMinter.SBTInfo(0, 1, shipper0SBTUri));
        _SBTMinter.upgradeCarrierRules(SBTMinter.SBTInfo(0, 1, carrier0SBTUri));
    }
}
