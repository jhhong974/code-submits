npx hardhat deploy --network local

npx hardhat createOrder --network local
npx hardhat selectOrder --network local --orderid 1

npx hardhat pickOrder --network local --orderid 1
npx hardhat completeOrder --network local --orderid 2

npx hardhat pickOrderWithoutSig --network local --orderid 2
npx hardhat completeOrderWithoutSig --network local --orderid 2


npx hardhat delayCancel --network local --orderid 2
npx hardhat cancelBeforePickup --network local --orderid 2 --sender "shipper"
npx hardhat cancelBeforePickup --network local --orderid 2 --sender "carrier"

npx hardhat expiredOrder --network local --orderid 2
npx hardhat cancelOrderByFault --network local --orderid 3 --sender "shipper"
npx hardhat cancelOrderByFault --network local --orderid 3 --sender "carrier"

npx hardhat setFee --network local --platformfee 100 --shipperfee 20 --carrierfee 5

//cancelbeforematch 토큰 전달 확인
//create시 조건 확인
//function selector extractor