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
import {SetUp} from "./SetUp.sol";

// [commend] forge test --match-path auditTest/DirectOrder.t.sol -vv
contract DirectOrder is SetUp {
    // 1. 정상적인 성공 시나리오
    function test_Case_1() public {
        orderId = _Order.getOrderId();
        price = 10000 ether;
        reward = 30 ether;
        collateral = price / _OrderRules.getCollateralPercent();

        CREATE_ORDER(
            orderId,
            shipper,
            departure,
            destination,
            packageWeight,
            price,
            expiredDate,
            ispickupContact,
            iscompleteContact,
            shipper,
            ""
        );

        Order.OrderSigData memory carrierOrderData = Order.OrderSigData(
            orderId,
            shipper,
            carrier,
            departure,
            destination,
            packageWeight,
            price,
            reward,
            collateral,
            expiredDate,
            _Order.getNonce(orderId, carrier)
        );
        Order.PermitSigData memory carrierPermitData = Order.PermitSigData(
            carrier, address(_Order), collateral, _Order.getNonce(orderId, carrier), block.timestamp
        );
        Order.PermitSigData memory shipperPermitData =
            Order.PermitSigData(shipper, address(_Order), reward, _Order.getNonce(orderId, shipper), block.timestamp);
        SELECT_ORDER(
            orderId,
            carrierOrderData,
            carrierPK,
            carrierPermitData,
            carrierPK,
            shipperPermitData,
            shipperPK,
            shipper, // caller
            ""
        );

        PICK_OREDR_WITHOUT_SIG(orderId, carrier, "");
        COMPLETE_ORDER_WITHOUT_SIG(orderId, carrier, "");
        CheckResult();
    }
    // 2. 매칭 전 취소 케이스
    function test_Case_2() public {
        orderId = _Order.getOrderId();
        price = 10000 ether;
        reward = 30 ether;
        collateral = price / _OrderRules.getCollateralPercent();

        CREATE_ORDER(
            orderId,
            shipper,
            departure,
            destination,
            packageWeight,
            price,
            expiredDate,
            ispickupContact,
            iscompleteContact,
            shipper,
            ""
        );

        CANCEL_ORDER_BEFORE_MATCH(orderId, shipper, "");
        CheckResult();
    }
    // 3. 픽업 전 Shipper에 의한 취소
    function test_Case_3() public {
        orderId = _Order.getOrderId();
        price = 10000 ether;
        reward = 30 ether;
        collateral = price / _OrderRules.getCollateralPercent();

        CREATE_ORDER(
            orderId,
            shipper,
            departure,
            destination,
            packageWeight,
            price,
            expiredDate,
            ispickupContact,
            iscompleteContact,
            shipper,
            ""
        );

        Order.OrderSigData memory carrierOrderData = Order.OrderSigData(
            orderId,
            shipper,
            carrier,
            departure,
            destination,
            packageWeight,
            price,
            reward,
            collateral,
            expiredDate,
            _Order.getNonce(orderId, carrier)
        );
        Order.PermitSigData memory carrierPermitData = Order.PermitSigData(
            carrier, address(_Order), collateral, _Order.getNonce(orderId, carrier), block.timestamp
        );
        Order.PermitSigData memory shipperPermitData =
            Order.PermitSigData(shipper, address(_Order), reward, _Order.getNonce(orderId, shipper), block.timestamp);
        SELECT_ORDER(
            orderId,
            carrierOrderData,
            carrierPK,
            carrierPermitData,
            carrierPK,
            shipperPermitData,
            shipperPK,
            shipper, // caller
            ""
        );
        CANCEL_ORDER_BEFORE_PICKUP(orderId, shipper, "");
        CheckResult();
    }
    // 4. 픽업 전 Carrier 의한 취소
    function test_Case_4() public {
        orderId = _Order.getOrderId();
        price = 10000 ether;
        reward = 30 ether;
        collateral = price / _OrderRules.getCollateralPercent();

        CREATE_ORDER(
            orderId,
            shipper,
            departure,
            destination,
            packageWeight,
            price,
            expiredDate,
            ispickupContact,
            iscompleteContact,
            shipper,
            ""
        );

        Order.OrderSigData memory carrierOrderData = Order.OrderSigData(
            orderId,
            shipper,
            carrier,
            departure,
            destination,
            packageWeight,
            price,
            reward,
            collateral,
            expiredDate,
            _Order.getNonce(orderId, carrier)
        );
        Order.PermitSigData memory carrierPermitData = Order.PermitSigData(
            carrier, address(_Order), collateral, _Order.getNonce(orderId, carrier), block.timestamp
        );
        Order.PermitSigData memory shipperPermitData =
            Order.PermitSigData(shipper, address(_Order), reward, _Order.getNonce(orderId, shipper), block.timestamp);
        SELECT_ORDER(
            orderId,
            carrierOrderData,
            carrierPK,
            carrierPermitData,
            carrierPK,
            shipperPermitData,
            shipperPK,
            shipper, // caller
            ""
        );
        CANCEL_ORDER_BEFORE_PICKUP(orderId, carrier, "");
        CheckResult();
    }
    // 5. 픽업 지연에 의한 Shipper의 취소 요청
    function test_Case_5() public {
        orderId = _Order.getOrderId();
        price = 10000 ether;
        reward = 30 ether;
        collateral = price / _OrderRules.getCollateralPercent();

        CREATE_ORDER(
            orderId,
            shipper,
            departure,
            destination,
            packageWeight,
            price,
            expiredDate,
            ispickupContact,
            iscompleteContact,
            shipper,
            ""
        );

        Order.OrderSigData memory carrierOrderData = Order.OrderSigData(
            orderId,
            shipper,
            carrier,
            departure,
            destination,
            packageWeight,
            price,
            reward,
            collateral,
            expiredDate,
            _Order.getNonce(orderId, carrier)
        );
        Order.PermitSigData memory carrierPermitData = Order.PermitSigData(
            carrier, address(_Order), collateral, _Order.getNonce(orderId, carrier), block.timestamp
        );
        Order.PermitSigData memory shipperPermitData =
            Order.PermitSigData(shipper, address(_Order), reward, _Order.getNonce(orderId, shipper), block.timestamp);
        SELECT_ORDER(
            orderId,
            carrierOrderData,
            carrierPK,
            carrierPermitData,
            carrierPK,
            shipperPermitData,
            shipperPK,
            shipper, // caller
            ""
        );

        uint256 current = block.timestamp;
        Order.order memory OrderInfo = _Order.getOrder(orderId);
        vm.warp(OrderInfo._pickupDate + 1); // 📌
        DELAY_PICKUP(orderId, shipper, "");

        vm.warp(current);
        CheckResult();
    }
    // 6. 배송 실패에 의한 Shipper의 배송 실패 요청
    function test_Case_6() public {
        orderId = _Order.getOrderId();
        price = 10000 ether;
        reward = 30 ether;
        collateral = price / _OrderRules.getCollateralPercent();

        CREATE_ORDER(
            orderId,
            shipper,
            departure,
            destination,
            packageWeight,
            price,
            expiredDate,
            ispickupContact,
            iscompleteContact,
            shipper,
            ""
        );

        Order.OrderSigData memory carrierOrderData = Order.OrderSigData(
            orderId,
            shipper,
            carrier,
            departure,
            destination,
            packageWeight,
            price,
            reward,
            collateral,
            expiredDate,
            _Order.getNonce(orderId, carrier)
        );
        Order.PermitSigData memory carrierPermitData = Order.PermitSigData(
            carrier, address(_Order), collateral, _Order.getNonce(orderId, carrier), block.timestamp
        );
        Order.PermitSigData memory shipperPermitData =
            Order.PermitSigData(shipper, address(_Order), reward, _Order.getNonce(orderId, shipper), block.timestamp);
        SELECT_ORDER(
            orderId,
            carrierOrderData,
            carrierPK,
            carrierPermitData,
            carrierPK,
            shipperPermitData,
            shipperPK,
            shipper, // caller
            ""
        );
        PICK_OREDR_WITHOUT_SIG(orderId, carrier, "");

        uint256 current = block.timestamp;
        Order.order memory OrderInfo = _Order.getOrder(orderId);
        vm.warp(OrderInfo._failDate + 1); // 📌
        EXPIRED_ORDER(orderId, shipper, "");

        vm.warp(current);
        CheckResult();
    }
}
