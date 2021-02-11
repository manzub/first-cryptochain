// import local node modules
const express = require('express')
const request = require("request")
const path = require('path')
const bodyParser = require("body-parser")
// import local blockchain application dependencies
const Blockchain = require('./blockchain')
const PubSub = require('./app/pubsub')
const TransactionPool = require('./wallet/transaction-pool')
const Wallet = require("./wallet")
const TransactionMiner = require("./app/transaction-miner")
// create new instances of imported dependencies
const app = express()
const blockchain = new Blockchain()
const transactionPool  =new TransactionPool()
const wallet = new Wallet()
const pubsub = new PubSub({ blockchain, transactionPool })
const transactionMiner = new TransactionMiner({ blockchain, transactionPool, wallet, pubsub})
// default port and default node address -- default vars to sync chains by other peers within our application
const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`
// configure express
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'client/dist')))
// endpoint to display all blocks in the chain
app.get('/api/blocks', (req, res)=>{
    res.json(blockchain.chain)
})
// add new block to the chain
app.post("/api/mine", (req, res)=>{
    const { data } = req.body
    blockchain.addBlock({ data })
    pubsub.broadcastChain()
    res.redirect("/api/blocks")
})
// create a new transaction and add to the transaction-pool
app.post("/api/transact", (req, res)=>{
    const { amount, recipient } = req.body
    if(amount && recipient) {
        let transaction = transactionPool.existingTransaction({ inputAddress: wallet.publicKey });
        try {
            if(transaction){
                transaction.update({ senderWallet: wallet, recipient, amount })
            }else{
                transaction = wallet.createTransaction({ recipient, amount, chain: blockchain.chain })
            }
        } catch (error) {
            return res.status(400).json({ type:'error',message:error.message })
        }
        transactionPool.setTransaction(transaction)
        pubsub.broadcastTransaction(transaction)
        res.json({ type:'success', message:transaction })
    }else{
        res.status(400).json({ type:'error', message:'Invalid recipient and amount'})
    }
})
// show all transactions in the transaction pool
app.get('/api/transaction-pool-map', (req, res)=>{
    res.json(transactionPool.transactionMap)
})
// mine a transaction in the pool
app.get('/api/mine-transactions', (req, res)=>{
    transactionMiner.mineTransactions()
    res.redirect('/api/blocks')
})
// display wallet balance and address
app.get('/api/wallet-info', (req, res)=>{
    const address = wallet.publicKey
    res.json({ 
        address, 
        balance: Wallet.calculateBalance({ chain: blockchain.chain, address }) 
    })
})
// display client side
app.get('*', (req, res)=>{
    res.sendFile(path.join(__dirname,'client/dist/index.html'))
})
// function to sync all chains in the network with the root node state
const syncWithRootState = () => {
    request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (error, response, body)=>{
        if (!error && response.statusCode === 200) {
            const rootChain = JSON.parse(body)
            console.log('replacing existing chain with requested global instance');
            blockchain.replaceChain(rootChain)
        }
    })

    request({ url: `${ROOT_NODE_ADDRESS }/api/transaction-pool-map`}, (error, response, body)=>{
        if(!error && response.statusCode === 200) {
            const rootTransactionMap = JSON.parse(body)
            console.log('replacing existing transaction map with requested global instance');
            transactionPool.setMap(rootTransactionMap)
        }
    })
}

let PEER_PORT;
if(process.env.GENERATE_PEER_PORT === 'true') {
    // generate a new port for a new peer instance of our application
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000)
}

const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, ()=>{
    console.log(`Listening at http://localhost:${PORT}`)
    // sync new peers on the system with the root state
    if (PORT !== DEFAULT_PORT) {
        syncWithRootState()
    }
})