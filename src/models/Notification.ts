import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    type: {
        type: String,
        enum: ['friend_request', 'group_invite', 'expense_added', 'payment', 'system'],
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    link: {
        type: String, // e.g., '/friends' or '/groups/123'
    },
    read: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
