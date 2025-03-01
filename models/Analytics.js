import mongoose from 'mongoose';
const { Schema } = mongoose;

const AnalyticsSchema = new Schema({
    account: { type: Schema.Types.ObjectId, ref: 'InstagramAccount', required: true },
    followers: Number,
    previousFollowers: Number,
    followerGrowth: Number,
    engagementRate: Number,
    previousEngagementRate: Number,
    engagementGrowth: Number,
    reach: Number,
    previousReach: Number,
    reachGrowth: Number,
    demographics: {
        ageGroups: Schema.Types.Mixed,
        gender: Schema.Types.Mixed,
        topLocations: [
            {
                country: String,
                percentage: Number
            }
        ]
    },
    topPosts: [
        {
            post: { type: Schema.Types.ObjectId, ref: 'Post' },
            likes: Number,
            commentsCount: Number,
            shares: Number
        }
    ],
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Analytics', AnalyticsSchema);
