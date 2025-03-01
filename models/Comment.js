import mongoose from 'mongoose';
const { Schema } = mongoose;

const CommentSchema = new Schema({
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    instagramId: { type: String, required: true, unique: true },
    user: {
        instagramId: String,
        username: String,
        profilePicture: String
    },
    text: { type: String },
    likes: { type: Number, default: 0 },
    timestamp: { type: Date },
    isHidden: { type: Boolean, default: false },
    isFlagged: { type: Boolean, default: false },
    isRead: { type: Boolean, default: false },
    replies: [
        {
            instagramId: String,
            user: {
                instagramId: String,
                username: String,
                profilePicture: String
            },
            text: String,
            timestamp: Date,
            likes: { type: Number, default: 0 }
        }
    ]
});

export default mongoose.model('Comment', CommentSchema);
