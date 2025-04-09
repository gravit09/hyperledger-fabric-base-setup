# hyperledger-fabric-base-setup
Hyperledger Fabric base template repo to setup network and chaincode.

# steps to setep up fabric network 

## install node

$ sudo apt install nodejs

$ node -v

$ git -v

$ npm -v

## install docker 

use docker desktop

## install fabric with file - install fabric sample repo and all required daocker images (peer, orderer, ccenv, ca, baseos)

$ chmod +x install-fabric.sh

$ ./install-fabric.sh docker samples binary


# Time to use fabric network 

1. setup network
    $ ./network up 

2. start channel 
    $ ./network.sh createChannel -c mychannel -ca -s couchdb

3. deploy chain code
    $ ./network.sh deployCC -ccn test09 -ccp ../asset-transfer-basic/chaincode-javascript/ -ccl javascript

4. Interacting with the network, run node-sdk server to call smartcontract 

    $ cd server-node-sdk/

    create admin cert and then user cert
    $ node 

    

FAQ

how to setup network with 5 node
what is channel and its use
what is org
how to add more org
what is peer
how to add more peer in org
can i deploy multipal chain code in one project.
what is chaincode life cycle.

BFT ordering service - https://hyperledger-fabric.readthedocs.io/en/latest/orderer/ordering_service.html

## Day 1 

## Day 2

## Day 3

