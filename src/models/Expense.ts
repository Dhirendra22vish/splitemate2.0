import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema({
    description: {
        type: String,
        required: [true, 'Please provide a description'],
    },
    type: {
        type: String,
        enum: ['expense', 'payment', 'deposit'],
        default: 'expense',
    },
    amount: {
        type: Number,
        required: [true, 'Please provide an amount'],
    },
    date: {
        type: Date,
        default: Date.now,
    },
    paidBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true,
    },
    splitBetween: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        amount: {
            type: Number
        }
    }],
}, { timestamps: true });

export default mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);
