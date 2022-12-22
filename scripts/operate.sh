#!/bin/bash

./create-artifacts.sh

cd artifacts
docker-compose up -d

./createChannel.sh
./deployChaincode.sh