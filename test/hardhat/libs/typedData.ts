export const permit_domain = (chainId,address) => {
    return({
        name: 'dKargo',
        version: '1',
        chainId: chainId,
        verifyingContract: address,
    })
}

export const order_domain = (chainId,address) => {
    return{
        name: 'Order',
        version: '1',
        chainId: chainId,
        verifyingContract: address,
    }
}

export const forwardRequest_domain = (chainId,address) => {
    return {
        name : "MinimalForwarder",
        version : "0.0.1",
        chainId: chainId,
        verifyingContract : address
    };
}

export const EIP712_domain = (name,version,chainId,address) => {
    return {
        name : name,
        version : version,
        chainId: chainId,
        verifyingContract : address
    };
}

export const permit_message =  (owner, spender, value, nonce, deadline) => {
    return{
        owner: owner,
        spender: spender,
        value: value,
        nonce: nonce,
        deadline: deadline
    }
    
}

export const permit_types =  () => {
    return{
        permitLodis : [
            {name: "owner", type: "address"},
            {name: "spender", type: "address"},
            {name: "value", type: "uint256"},
            {name: "nonce", type: "uint256"},
            {name: "deadline", type: "uint256"},
        ]
    }
}

export const order_types =  () => {
    return{
        OrderSigData: [
            { name: 'orderId', type: 'uint256' },
            { name: 'shipper', type: 'address' },
            { name: 'carrier', type: 'address' },
            { name: 'departure', type: 'bytes32' },
            { name: 'destination', type: 'bytes32' },
            { name: 'packageWeight', type: 'bytes32' },
            { name: 'packagePrice', type: 'uint256' },
            { name: 'reward', type: 'uint256' },
            { name: 'collateral', type: 'uint256' },
            { name: 'expiredDate', type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
        ]
    }   
}

export const forwardRequest_types =  () => {
    return{
        ForwardRequest: [
            { name: 'from', type: 'address' },
            { name: 'to', type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'gas', type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
            { name: 'data', type: 'bytes' },
        ]
    }   
}