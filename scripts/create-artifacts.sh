GREEN='\033[0;32m'

echo -e "${GREEN}Creating crypto materials..."
cryptogen generate --config=../artifacts/crypto-config.yaml --output=../artifacts/crypto-config
echo -e "${GREEN}Generated crypto materials successfully!!!"

echo -e "${GREEN}Generating connection profiles for each organization..."
./generate-ccp.sh
echo -e "${GREEN}Connection profiles generated successfully!!!"

SYS_CHANNEL="sys-channel"

CHANNEL_NAME="mychannel"

echo -e $CHANNEL_NAME

echo -e "${GREEN}Generating genesis block and mychannel.tx files..."
configtxgen -configPath ../artifacts -profile SupplyOrdererGenesis -channelID $SYS_CHANNEL -outputBlock ../artifacts/genesis.block

configtxgen -configPath ../artifacts -profile SupplyChannel -channelID $CHANNEL_NAME -outputCreateChannelTx ../artifacts/mychannel.tx
echo -e "${GREEN}Genesis block anf mychannel.tx file generated successfully in artifacts folder!!!"

echo -e "${GREEN}Creating anchor peers for each organization..."
configtxgen -profile SupplyChannel -configPath ../artifacts -outputAnchorPeersUpdate ../artifacts/ProducerMSPAnchors.tx -channelID $CHANNEL_NAME -asOrg ProducerMSP
configtxgen -profile SupplyChannel -configPath ../artifacts -outputAnchorPeersUpdate ../artifacts/RetailerMSPAnchors.tx -channelID $CHANNEL_NAME -asOrg RetailerMSP
configtxgen -profile SupplyChannel -configPath ../artifacts -outputAnchorPeersUpdate ../artifacts/ManufacturerMSPAnchors.tx -channelID $CHANNEL_NAME -asOrg ManufacturerMSP
configtxgen -profile SupplyChannel -configPath ../artifacts -outputAnchorPeersUpdate ../artifacts/DelivererMSPAnchors.tx -channelID $CHANNEL_NAME -asOrg DelivererMSP
echo -e "${GREEN}Anchor peers created successfully!!!"

