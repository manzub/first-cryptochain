const Transaction = require("./transaction")

class TransactionPool {
    constructor() {
        this.transactionMap = {}
    }

    clear() {
        this.transactionMap = {}
    }

    setTransaction(transaction) {
        this.transactionMap[transaction.id] = transaction
    }

    removeTransaction(transaction) {
        let newMap = Object.values(this.transactionMap)
            .filter((t)=> t.id !== transaction.id)
        this.clear()
        newMap.forEach(elem=>this.setTransaction(elem))
    }

    setMap(transactionMap) {
        this.transactionMap = transactionMap
    }

    existingTransaction({ inputAddress }) {
        const transactions = Object.values(this.transactionMap)
        return transactions.find(transaction => transaction.input.address === inputAddress)
    }

    validTransactions() {
        return Object.values(this.transactionMap).filter(
            transaction => Transaction.validTransaction(transaction)
        )
    }

    clearBlockchainTransactions({ chain }) {
        for(let i=1; i<chain.length; i++) {
            const block = chain[i]
            for(let transaction of block.data) {
                if(this.transactionMap[transaction.id]){
                    delete this.transactionMap[transaction.id]
                }
            }
        }
    }
}

module.exports = TransactionPool;