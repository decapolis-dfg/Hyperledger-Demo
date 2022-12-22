export CORE_PEER_TLS_ENABLED=true
export ORDERER_CA=${PWD}/../artifacts/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
export PEER0_PRODUCER_CA=${PWD}/../artifacts/crypto-config/peerOrganizations/producer.example.com/peers/peer0.producer.example.com/tls/ca.crt
export PEER0_RETAILER_CA=${PWD}/../artifacts/crypto-config/peerOrganizations/retailer.example.com/peers/peer0.retailer.example.com/tls/ca.crt
export PEER0_MANUFACTURER_CA=${PWD}/../artifacts/crypto-config/peerOrganizations/manufacturer.example.com/peers/peer0.manufacturer.example.com/tls/ca.crt
export PEER0_DELIVERER_CA=${PWD}/../artifacts/crypto-config/peerOrganizations/deliverer.example.com/peers/peer0.deliverer.example.com/tls/ca.crt
export FABRIC_CFG_PATH=${PWD}/../artifacts/channel-config/config/
export CHANNEL_NAME=mychannel

GREEN='\033[0;32m'


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

createChannel(){
    # rm -rf ../artifacts/channel/*

    echo -e "${GREEN}Creating channel $CHANNEL_NAME "
    setGlobalsForPeer0Producer
    
    peer channel create -o localhost:7050 -c $CHANNEL_NAME \
    --ordererTLSHostnameOverride orderer.example.com \
    -f ../artifacts/${CHANNEL_NAME}.tx --outputBlock ../artifacts/${CHANNEL_NAME}.block \
    --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA

    echo -e "${GREEN}================================Channel '$CHANNEL_NAME' created ================================"
}


joinChannel(){
    setGlobalsForPeer0Producer
    peer channel join -b ../artifacts/$CHANNEL_NAME.block
    
    setGlobalsForPeer0Retailer
    peer channel join -b ../artifacts/$CHANNEL_NAME.block
    
    setGlobalsForPeer0Manufacturer
    peer channel join -b ../artifacts/$CHANNEL_NAME.block
    
    setGlobalsForPeer0Deliverer
    peer channel join -b ../artifacts/$CHANNEL_NAME.block
    
}

updateAnchorPeers(){
    setGlobalsForPeer0Producer
    peer channel update -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com -c $CHANNEL_NAME -f ../artifacts/${CORE_PEER_LOCALMSPID}Anchors.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA
    
    setGlobalsForPeer0Retailer
    peer channel update -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com -c $CHANNEL_NAME -f ../artifacts/${CORE_PEER_LOCALMSPID}Anchors.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA

    setGlobalsForPeer0Manufacturer
    peer channel update -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com -c $CHANNEL_NAME -f ../artifacts/${CORE_PEER_LOCALMSPID}Anchors.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA
    
    setGlobalsForPeer0Deliverer
    peer channel update -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com -c $CHANNEL_NAME -f ../artifacts/${CORE_PEER_LOCALMSPID}Anchors.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA
}

createChannel
joinChannel
updateAnchorPeers
