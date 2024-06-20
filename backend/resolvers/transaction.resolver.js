import Transaction from "../models/transaction.model.js";

const transactionResolver = {
    Query: {
        transactions: async (_, __, context) => {
            try {
                if (!context.getUser()) {
                    throw new Error('Unauthorized')
                }
                const userId = context.getUser()._id

                const transactions = await Transaction.find({ userId })
                return transactions
            } catch (e) {
                console.error("Error getting transactions: ", e)
                throw new Error(e.message)
            }
        },
        transaction: async (_, { transactionId }, context) => {
            try {
                const transaction = await Transaction.findById(transactionId)
                return transaction
            } catch (e) {
                console.error("Error getting transaction: ", e)
                throw new Error(e.message)
            }
        }
    },
    Mutation: {
        createTransaction: async (_, { input }, context) => {
            try {
                const newTransaction = new Transaction({
                    ...input,
                    userId: context.getUser()._id
                })

                await newTransaction.save()
                return newTransaction
            } catch (e) {
                console.error("Error creating transaction: ", e)
                throw new Error(e.message)
            }
        },
        updateTransaction: async (_, { transactionId, input }, context) => {
            try {
                const updatedTransaction = await Transaction.findByIdAndUpdate(transactionId, input, { new: true })
                return updatedTransaction
            } catch (e) {
                console.error("Error updating transaction: ", e)
                throw new Error(e.message)
            }
        },
        deleteTransaction: async (_, { transactionId }) => {
            try {
                const deletedTransaction = await Transaction.findByIdAndDelete(transactionId)
                return deletedTransaction
            } catch (e) {
                console.error("Error deleting transaction: ", e)
                throw new Error(e.message)
            }
        }
    }
}

export default transactionResolver
