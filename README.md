# Hyperledger-Demo
## To Run Delmonte Demo
1- Navigate to scripts
Run ./create-artifacts.sh

2- Back to main dir
Run docker-compose up -d

3- Navigate to scripts
Run ./createChannel.sh
Run ./deployChaincode.sh

4- Navigate to app/server dir
Run ./wallets.sh
Run nodemon index.ts

5- Open new terminal and navigate to app/client
Run yarn start