const {ethers} = require('ethers')
const {abi} = require('../../artifacts/contracts/SBTMinter.sol/SBTMinter.json')

const LODIS_SBT_IMAGE_URL = {
    DEV : {
        "Lodis Sbt Carrier" : "https://dev-lodis.s3.ap-northeast-2.amazonaws.com/lodiscan/sbt/first-delivery.png",
        "Lodis Sbt Shipper" : "https://dev-lodis.s3.ap-northeast-2.amazonaws.com/lodiscan/sbt/speed-delivery.png"
    },
    STAG : {
        "Lodis Sbt Carrier" : "https://stg-lodis.s3.ap-northeast-2.amazonaws.com/lodiscan/sbt/first-delivery.png",
        "Lodis Sbt Shipper" : "https://stg-lodis.s3.ap-northeast-2.amazonaws.com/lodiscan/sbt/speed-delivery.png"
    }
}

/**
 * 
 * @param {DEV,STAG} envir 
 * @param {Carrier, Shipper} subject 
 */
const encodeSBTTokenURL = (envir,subject) => {
    const NFTMetaData = {
        "external_url" : "https://lodis.io/",
        "image" : LODIS_SBT_IMAGE_URL[envir][subject],
        "name" : subject
    }

    let _NFTMetaData = JSON.stringify(NFTMetaData);
    _NFTMetaData = ethers.utils.toUtf8Bytes(_NFTMetaData)
    _NFTMetaData = "data:application/json;base64," + ethers.utils.base64.encode(_NFTMetaData)
    return _NFTMetaData;
}

const decodeSBTTokenURL = (url) => {
    url = url.replace("data:application/json;base64,","");
    let NFTMetaData = ethers.utils.base64.decode(url)
    NFTMetaData = ethers.utils.toUtf8String(NFTMetaData)
    NFTMetaData = JSON.parse(NFTMetaData);
    return {
        description : NFTMetaData.description,
        external_url : NFTMetaData.external_url,
        image : NFTMetaData.image,
        name : NFTMetaData.name
    };
}

const initUpgradeShipperRules = async (CA,signer,tokenUri) => {
    const rule = {
        tier: 0, // 최초 발행 티어 = 0
        requirement: 1, //  발행 조건 : CompleteOrder 1회
        uri: tokenUri
    }

    const SBTMinter = new ethers.Contract(CA,abi,signer);
    const tx = await SBTMinter.upgradeShipperRules(rule);
    await tx.wait();
}

const initUpgradeCarrierRules = async (CA,signer,tokenUri) => {
    const rule = {
        tier: 0, // 최초 발행 티어 = 0
        requirement: 1, //  발행 조건 : CompleteOrder 1회
        uri: tokenUri
    }
    const SBTMinter = new ethers.Contract(CA,abi,signer);
    const tx = await SBTMinter.upgradeCarrierRules(rule);
    await tx.wait()
}


module.exports = {encodeSBTTokenURL, decodeSBTTokenURL, initUpgradeShipperRules, initUpgradeCarrierRules}