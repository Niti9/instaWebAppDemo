import mongoose from 'mongoose';
const { Schema } = mongoose;

const PostSchema = new Schema({
    account: { type: Schema.Types.ObjectId, ref: 'InstagramAccount', required: true },
    instagramId: { type: String, required: true, unique: true },
    mediaType: { type: String, enum: ['IMAGE', 'VIDEO', 'CAROUSEL_ALBUM'] },
    mediaUrl: { type: String },
    permalink: { type: String },
    caption: { type: String },
    hashtags: [String],
    location: {
        id: String,
        name: String,
        latitude: Number,
        longitude: Number
    },
    likes: Number,
    commentsCount: Number,
    shares: Number,
    saves: Number,
    reach: Number,
    impressions: Number,
    timestamp: { type: Date }
});

export default mongoose.model('Post', PostSchema);
