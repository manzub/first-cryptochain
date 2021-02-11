const Transaction = require("../wallet/transaction")

class TransactionMiner{
    constructor({ blockchain, transactionPool, wallet, pubsub }) {
        this.blockchain = blockchain
        this.transactionPool = transactionPool
        this.wallet = wallet
        this.pubsub = pubsub
    }

    mineTransactions() {
        const validTransactions = this.transactionPool.validTransactions();
        const randTfromTPool = validTransactions[Math.floor(Math.random()*validTransactions.length)]
        const transactionsToAdd = [randTfromTPool]
        transactionsToAdd.push(
            Transaction.rewardTransaction({ minerWallet: this.wallet })
        )
        this.blockchain.addBlock({ data: transactionsToAdd })
        this.pubsub.broadcastChain()
        this.transactionPool.removeTransaction(randTfromTPool)
    }
}

module.exports = TransactionMiner;