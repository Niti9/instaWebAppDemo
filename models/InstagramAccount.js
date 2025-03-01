import mongoose from 'mongoose';
const { Schema } = mongoose;

const InstagramAccountSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    instagramId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    fullName: { type: String },
    profilePicture: { type: String },
    bio: { type: String },
    website: { type: String },
    followers: { type: Number, default: 0 },
    following: { type: Number, default: 0 },
    postsCount: { type: Number, default: 0 },
    type: { type: String, enum: ['business', 'personal'], default: 'personal' },
    accessToken: { type: String, required: true },
    tokenExpiresAt: { type: Date },
    connectedAt: { type: Date, default: Date.now }
});

export default mongoose.model('InstagramAccount', InstagramAccountSchema);
