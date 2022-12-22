# ../docker-compose down

docker rm -f $(docker ps -aq)
rm -rf ../artifacts/crypto-config
rm -rf ../artifacts/genesis.block
rm -rf ../artifacts/DelivererMSPAnchors.tx 
rm -rf ../artifacts/ProducerMSPAnchors.tx
rm -rf ../artifacts/RetailerMSPAnchors.tx 
rm -rf ../artifacts/ManufacturerMSPAnchors.tx 
rm -rf ../artifacts/mychannel.tx
rm -rf ../artifacts/mychannel.block
rm -rf ../artifacts/channel

rm -rf ../connections/connection-producer.json 
rm -rf ../connections/connection-producer.yaml
rm -rf ../connections/connection-retailer.yaml 
rm -rf ../connections/connection-retailer.json
rm -rf ../connections/connection-manufacturer.yaml 
rm -rf ../connections/connection-manufacturer.json
rm -rf ../connections/connection-deliverer.yaml   
rm -rf ../connections/connection-deliverer.json 
 
rm -rf ../app/server/identity
rm -rf ../app/client/src/assets/*.pdf
rm -rf ./scm-contract.tar.gz
rm -rf ./log.txt
 
 

 
