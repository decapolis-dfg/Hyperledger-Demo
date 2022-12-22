export CORE_PEER_TLS_ENABLED=true
export ORDERER_CA=${PWD}/../artifacts/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
export PEER0_PRODUCER_CA=${PWD}/../artifacts/crypto-config/peerOrganizations/producer.example.com/peers/peer0.producer.example.com/tls/ca.crt
export PEER0_RETAILER_CA=${PWD}/../artifacts/crypto-config/peerOrganizations/retailer.example.com/peers/peer0.retailer.example.com/tls/ca.crt
export PEER0_MANUFACTURER_CA=${PWD}/../artifacts/crypto-config/peerOrganizations/manufacturer.example.com/peers/peer0.manufacturer.example.com/tls/ca.crt
export PEER0_DELIVERER_CA=${PWD}/../artifacts/crypto-config/peerOrganizations/deliverer.example.com/peers/peer0.deliverer.example.com/tls/ca.crt
export FABRIC_CFG_PATH=${PWD}/../artifacts/channel-config/config/

GREEN='\033[0;32m'

#export CHANNEL_NAME=mychannel

setGlobalsForOrderer(){
    export CORE_PEER_LOCALMSPID="OrdererMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/../artifacts/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
    export CORE_PEER_MSPCONFIGPATH=${PWD}/../artifacts/crypto-config/ordererOrganizations/example.com/users/Admin@example.com/msp
}

setGlobalsForPeer0Producer(){
    export CORE_PEER_LOCALMSPID="ProducerMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_PRODUCER_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/../artifacts/crypto-config/peerOrganizations/producer.example.com/users/Admin@producer.example.com/msp
    export CORE_PEER_ADDRESS=localhost:7051
}

setGlobalsForPeer0Retailer(){
    export CORE_PEER_LOCALMSPID="RetailerMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_RETAILER_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/../artifacts/crypto-config/peerOrganizations/retailer.example.com/users/Admin@retailer.example.com/msp
    export CORE_PEER_ADDRESS=localhost:8051
    
}

setGlobalsForPeer0Manufacturer(){
    export CORE_PEER_LOCALMSPID="ManufacturerMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_MANUFACTURER_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/../artifacts/crypto-config/peerOrganizations/manufacturer.example.com/users/Admin@manufacturer.example.com/msp
    export CORE_PEER_ADDRESS=localhost:9051
    
}

setGlobalsForPeer0Deliverer(){
    export CORE_PEER_LOCALMSPID="DelivererMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_DELIVERER_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/../artifacts/crypto-config/peerOrganizations/deliverer.example.com/users/Admin@deliverer.example.com/msp
    export CORE_PEER_ADDRESS=localhost:10051
    
}

CHANNEL_NAME="mychannel"
CC_RUNTIME_LANGUAGE="node"
VERSION="1"
CC_SRC_PATH="../chaincode"
CC_NAME="scm-contract"


packageChaincode() {
    rm -rf ${CC_NAME}.tar.gz
    
    peer lifecycle chaincode package ./${CC_NAME}.tar.gz \
        --path ${CC_SRC_PATH} --lang ${CC_RUNTIME_LANGUAGE} \
        --label ${CC_NAME}_${VERSION}
    echo -e "${GREEN}===================== Chaincode is packaged on peer0.producer ===================== "
}
packageChaincode

installChaincode() {
    setGlobalsForPeer0Producer
    peer lifecycle chaincode install ${CC_NAME}.tar.gz
    echo -e "${GREEN}===================== Chaincode is installed on peer0.producer ===================== "

     setGlobalsForPeer0Retailer
     peer lifecycle chaincode install ${CC_NAME}.tar.gz
     echo -e "${GREEN}===================== Chaincode is installed on peer0.retailer ===================== "

     setGlobalsForPeer0Manufacturer
     peer lifecycle chaincode install ${CC_NAME}.tar.gz
     echo -e "${GREEN}===================== Chaincode is installed on peer0.manufacturer ===================== "

     setGlobalsForPeer0Deliverer
     peer lifecycle chaincode install ${CC_NAME}.tar.gz
     echo -e "${GREEN}===================== Chaincode is installed on peer0.deliverer ===================== "
}
installChaincode

queryInstalled() {
    setGlobalsForPeer0Producer
    peer lifecycle chaincode queryinstalled >& ./log.txt
    cat log.txt
    PACKAGE_ID=$(sed -n "/${CC_NAME}_${VERSION}/{s/^Package ID: //; s/, Label:.*$//; p;}" ./log.txt)
    echo -e P${GREEN}ackageID is ${PACKAGE_ID}
    echo -e "${GREEN}===================== Query installed successful on peer0.producer on channel ===================== "
}

queryInstalled

approveForMyProducer() {
    setGlobalsForPeer0Producer
    # set -x
    peer lifecycle chaincode approveformyorg -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.example.com --tls \
        --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME} --version ${VERSION} \
        --init-required --package-id ${PACKAGE_ID} \
        --sequence ${VERSION}
    # set +x

    echo -e "${GREEN}===================== chaincode approved from producer organization ===================== "

}
approveForMyProducer

approveForMyRetailer() {
    setGlobalsForPeer0Retailer

    peer lifecycle chaincode approveformyorg -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.example.com --tls $CORE_PEER_TLS_ENABLED \
        --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME} \
        --version ${VERSION} --init-required --package-id ${PACKAGE_ID} \
        --sequence ${VERSION}

    echo -e "${GREEN}===================== chaincode approved from retailer organization ===================== "
}
approveForMyRetailer

approveForMyManufacturer() {
    setGlobalsForPeer0Manufacturer

    peer lifecycle chaincode approveformyorg -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.example.com --tls $CORE_PEER_TLS_ENABLED \
        --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME} \
        --version ${VERSION} --init-required --package-id ${PACKAGE_ID} \
        --sequence ${VERSION}

    echo -e "${GREEN}===================== chaincode approved from manufacturer organization ===================== "
}
approveForMyManufacturer

approveForMyDeliverer() {
    setGlobalsForPeer0Deliverer

    peer lifecycle chaincode approveformyorg -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.example.com --tls $CORE_PEER_TLS_ENABLED \
        --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME} \
        --version ${VERSION} --init-required --package-id ${PACKAGE_ID} \
        --sequence ${VERSION}

    echo -e "${GREEN}===================== chaincode approved from deliverer organization ===================== "
}
approveForMyDeliverer

checkCommitReadiness() {
    setGlobalsForPeer0Producer
    peer lifecycle chaincode checkcommitreadiness \
        --channelID $CHANNEL_NAME --name ${CC_NAME} --version ${VERSION} \
        --sequence ${VERSION} --output json --init-required
    echo -e "${GREEN}===================== checking commit readiness from all organizations ===================== "
}
checkCommitReadiness

commitChaincodeDefination() {
    setGlobalsForPeer0Producer
    #required to get crypto materials like msp
    peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
        --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA \
        --channelID $CHANNEL_NAME --name ${CC_NAME} \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_PRODUCER_CA \
        --peerAddresses localhost:8051 --tlsRootCertFiles $PEER0_RETAILER_CA \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_MANUFACTURER_CA \
        --peerAddresses localhost:10051 --tlsRootCertFiles $PEER0_DELIVERER_CA \
        --version ${VERSION} --sequence ${VERSION} --init-required

}
commitChaincodeDefination

queryCommitted() {
    setGlobalsForPeer0Producer
    peer lifecycle chaincode querycommitted --channelID $CHANNEL_NAME --name ${CC_NAME}

}
queryCommitted

chaincodeInvokeInit() {
    setGlobalsForPeer0Producer
    peer chaincode invoke -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.example.com \
        --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA \
        -C $CHANNEL_NAME -n ${CC_NAME} \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_PRODUCER_CA \
        --peerAddresses localhost:8051 --tlsRootCertFiles $PEER0_RETAILER_CA \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_MANUFACTURER_CA \
        --peerAddresses localhost:10051 --tlsRootCertFiles $PEER0_DELIVERER_CA \
        --isInit -c '{"Args":[]}'

}
chaincodeInvokeInit