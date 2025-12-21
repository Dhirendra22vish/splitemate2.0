import mongoose from 'mongoose';

const RecurringExpenseSchema = new mongoose.Schema({
    description: {
        type: String,
        required: [true, 'Please provide a description'],
    },
    amount: {
        type: Number,
        required: [true, 'Please provide an amount'],
    },
    frequency: {
        type: String,
        enum: ['weekly', 'monthly', 'yearly'],
        required: [true, 'Please specify frequency'],
    },
    startDate: {
        type: Date,
        default: Date.now,
    },
    nextRunDate: {
        type: Date,
        required: true,
    },
    active: {
        type: Boolean,
        default: true,
    },
    lastGeneratedDate: {
        type: Date,
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

export default mongoose.models.RecurringExpense || mongoose.model('RecurringExpense', RecurringExpenseSchema);
