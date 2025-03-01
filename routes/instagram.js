import express from 'express';
import {
    getInstagramAuthUrl,
    instagramAuthCallback,
    getInstagramAccounts,
    getFeed,
    getPosts,
    getComments,
    getMessages,
    getAnalytics
} from '../controllers/instagramController.js';

const router = express.Router();

// 1. Get the Instagram OAuth URL (client uses this to initiate the login process)
router.get('/auth/url', getInstagramAuthUrl);

// 2. OAuth callback – Instagram redirects back here with the authorization code
router.get('/auth/callback', instagramAuthCallback);

// 3. Get all linked Instagram accounts for the authenticated user
router.get('/accounts', getInstagramAccounts);

// 4. Get feed (media)
router.get('/:accountId/feed', getFeed);

// 5. Get posts (can be similar to feed)
router.get('/:accountId/posts', getPosts);

// 6. Get comments (requires a postId query parameter)
router.get('/:accountId/comments', getComments);

// 7. Get messages (not supported; returns 501)
router.get('/:accountId/messages', getMessages);

// 8. Get analytics/insights
router.get('/:accountId/analytics', getAnalytics);

export default router;
