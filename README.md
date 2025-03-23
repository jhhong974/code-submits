# code-submits
For submitting solidity-based smartcontract code samples

본 코드는 2023년 2분기에 C2C 배송서비스 프로토타입 형식으로 만들었던 코드입니다.

배송 플로우는 아래와 같습니다.
- 화주(Shipper)가 주문을 생성 (createOrder)
- 배송자 (Carrier)가 배송할 주문을 선택 (selectOrder)
- 배송자 (Carrier)가 배송할 주문을 픽업 (pickOrder)
- 배송자 (Carrier)가 배송지에 배송완료 (completeOrder)

코드는 solidity 기반 스마트컨트랙트 코드이며 하기의 내용들이 포함되어 있습니다.
* Solidity
  - EIP 2770, 2771 기반 수수료 위임대납
  - EIP-712 기반 custom struct signature
  - EIP-2612 permit
  - UUPS 기반 upgradable contract (OrderRules, SBTMinter)
  - SBT 표준 (EIP-5192, 5484)  - 
* hardhat (ts)
* foundry

## 실행 방법
```
yarn
cp .env.example .env
yarn hardhat compile
[동일 디렉토리에서 새 터미널 띄우고] yarn hardhat node
.env 파일 업데이트
- address#0, #1, #2의 개인키를 ADMIN_KEY, SHIPPER_KEY, CARRIER_KEY에 넣고 저장
yarn hardhat run scripts/deploy.js
.env 파일 업데이트
- contracts.json의 TxForwarderCA ->FORWARDER, OrderCA ->ORDER, DKA ->TOKEN 에 넣고
- PROVIDER=http://127.0.0.1:8545 로 기입한 후 저장
yarn run test test/hardhat/Scenario.test.ts
- (시작 전 잔금 출력하고, 주문생성, 배송선택, 픽업, 배송완료의 일련의 과정 수행 후 잔금 출력하고 종료)
```


## foundry 파일 실행 방법
- foundry 설치
- forge-std가 설치안될 경우 수동설치
  - mkdir -p lib
  - git clone https://github.com/foundry-rs/forge-std.git lib/forge-std
- forge build
- forge test --match-path test/foundry/DirectOrder.t.sol -vv
