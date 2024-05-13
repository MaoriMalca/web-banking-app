const User = require('../models/User');
const Transaction = require('../models/Transaction');

exports.createTransaction = async (req, res) => {
    const { senderId, receiverEmail, amount } = req.body;

    try {
        const receiver = await User.findOne({ email: receiverEmail });
        if (!receiver) {
            return res.status(404).json({ error: "Receiver not found" });
        }

        const sender = await User.findById(senderId);
        if (!sender) {
            return res.status(404).json({ error: "Sender not found" });
        }

        if (sender.balance < amount) {
            return res.status(400).json({ error: "Insufficient funds" });
        }

        // Create transaction
        const transaction = await Transaction.create({
            sender: sender._id,
            receiver: receiver._id,
            amount: amount
        });

        // Update balances
        sender.balance -= amount;
        receiver.balance += amount;
        await sender.save();
        await receiver.save();

        res.status(201).json({ message: "Transaction successful", transaction });
    } catch (error) {
        res.status(500).json({ error: "Server error during transaction", details: error.message });
    }
};

exports.listTransactions = async (req, res) => {
    const { userId } = req.params;

    try {
        const transactions = await Transaction.find({
            $or: [{ sender: userId }, { receiver: userId }]
        }).populate('sender receiver', 'email');
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: "Server failed to fetch transactions", details: error.message });
    }
};
