#!/bin/bash

function one_line_pem {
    echo "`awk 'NF {sub(/\\n/, ""); printf "%s\\\\\\\n",$0;}' $1`"
}

function json_ccp {
    local PP=$(one_line_pem $5)
    local CP=$(one_line_pem $6)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${ORGMSP}/$2/" \
        -e "s/\${P0PORT}/$3/" \
        -e "s/\${CAPORT}/$4/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        ../connections/ccp-template.json 
}

function yaml_ccp {
    local PP=$(one_line_pem $5)
    local CP=$(one_line_pem $6)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${ORGMSP}/$2/" \
        -e "s/\${P0PORT}/$3/" \
        -e "s/\${CAPORT}/$4/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        ../connections/ccp-template.yaml | sed -e $'s/\\\\n/\\\n          /g'
}


ORG=producer
ORGMSP=Producer
P0PORT=7051
CAPORT=7054
PEERPEM=../artifacts/crypto-config/peerOrganizations/producer.example.com/tlsca/tlsca.producer.example.com-cert.pem
CAPEM=../artifacts/crypto-config/peerOrganizations/producer.example.com/ca/ca.producer.example.com-cert.pem

echo "$(json_ccp $ORG $ORGMSP $P0PORT $CAPORT $PEERPEM $CAPEM)" > ../connections/connection-producer.json
echo "$(yaml_ccp $ORG $ORGMSP $P0PORT $CAPORT $PEERPEM $CAPEM)" > ../connections/connection-producer.yaml

ORG=manufacturer
ORGMSP=Manufacturer
P0PORT=9051
CAPORT=9054
PEERPEM=../artifacts/crypto-config/peerOrganizations/manufacturer.example.com/tlsca/tlsca.manufacturer.example.com-cert.pem
CAPEM=../artifacts/crypto-config/peerOrganizations/manufacturer.example.com/ca/ca.manufacturer.example.com-cert.pem

echo "$(json_ccp $ORG $ORGMSP $P0PORT $CAPORT $PEERPEM $CAPEM)" > ../connections/connection-manufacturer.json
echo "$(yaml_ccp $ORG $ORGMSP $P0PORT $CAPORT $PEERPEM $CAPEM)" > ../connections/connection-manufacturer.yaml

ORG=deliverer
ORGMSP=Deliverer
P0PORT=10051
CAPORT=10054
PEERPEM=../artifacts/crypto-config/peerOrganizations/deliverer.example.com/tlsca/tlsca.deliverer.example.com-cert.pem
CAPEM=../artifacts/crypto-config/peerOrganizations/deliverer.example.com/ca/ca.deliverer.example.com-cert.pem

echo "$(json_ccp $ORG $ORGMSP $P0PORT $CAPORT $PEERPEM $CAPEM)" > ../connections/connection-deliverer.json
echo "$(yaml_ccp $ORG $ORGMSP $P0PORT $CAPORT $PEERPEM $CAPEM)" > ../connections/connection-deliverer.yaml

ORG=retailer
ORGMSP=Retailer
P0PORT=8051
CAPORT=8054
PEERPEM=../artifacts/crypto-config/peerOrganizations/retailer.example.com/tlsca/tlsca.retailer.example.com-cert.pem
CAPEM=../artifacts/crypto-config/peerOrganizations/retailer.example.com/ca/ca.retailer.example.com-cert.pem

echo "$(json_ccp $ORG $ORGMSP $P0PORT $CAPORT $PEERPEM $CAPEM)" > ../connections/connection-retailer.json
echo "$(yaml_ccp $ORG $ORGMSP $P0PORT $CAPORT $PEERPEM $CAPEM)" > ../connections/connection-retailer.yaml