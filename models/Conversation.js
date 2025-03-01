import mongoose from 'mongoose';
const { Schema } = mongoose;

const MessageSchema = new Schema({
    instagramId: String,
    text: String,
    fromMe: Boolean,
    timestamp: Date,
    isRead: { type: Boolean, default: false },
    media: { type: String, default: 'none' },
    mediaUrl: String
});

const ConversationSchema = new Schema({
    instagramId: { type: String, required: true, unique: true },
    user: {
        instagramId: String,
        username: String,
        fullName: String,
        profilePicture: String
    },
    lastMessage: {
        text: String,
        timestamp: Date,
        fromMe: Boolean,
        isRead: Boolean
    },
    unreadCount: { type: Number, default: 0 },
    messages: [MessageSchema],
    isArchived: { type: Boolean, default: false },
    isFlagged: { type: Boolean, default: false }
});

export default mongoose.model('Conversation', ConversationSchema);
