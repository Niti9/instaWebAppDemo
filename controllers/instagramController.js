import axios from "axios";
import querystring from "querystring";
import InstagramAccount from "../models/InstagramAccount.js";

// Set up base URLs
const IG_AUTH_URL = "https://api.instagram.com/oauth/authorize";
const IG_TOKEN_URL = "https://api.instagram.com/oauth/access_token";
const IG_API_URL = "https://graph.instagram.com";

// 1. Generate the Instagram OAuth URL for the client to authenticate
export const getInstagramAuthUrl = (req, res) => {
  const { IG_CLIENT_ID, IG_REDIRECT_URI } = process.env;
  const authUrl = `${IG_AUTH_URL}?client_id=${IG_CLIENT_ID}&redirect_uri=${IG_REDIRECT_URI}&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights&response_type=code`;
  res.json({ authUrl });
};

// 2. Handle OAuth callback from Instagram – exchange the code for an access token
export const instagramAuthCallback = async (req, res, next) => {
  const { code } = req.query;
  console.log("code is", code);
  // const code = "AQCkPVoqjzN9P16cv5zimcwd50lgwfLAr7DFjCCC0x9RiTGs614UJDiNQco6u_st210HLqlhOUGzVikeCVCeUVM5GVFvc4aAa";
  if (!code)
    return res.status(400).json({ message: "Authorization code not provided" });

  try {
    const { IG_CLIENT_ID, IG_CLIENT_SECRET, IG_REDIRECT_URI } = process.env;
    // Exchange code for an access token
    const tokenResponse = await axios.post(
      IG_TOKEN_URL,
      querystring.stringify({
        client_id: IG_CLIENT_ID,
        client_secret: IG_CLIENT_SECRET,
        grant_type: "authorization_code",
        redirect_uri: IG_REDIRECT_URI,
        code
      })
    );

    console.log("response-->", tokenResponse);
    const { access_token, user_id } = tokenResponse.data;

    // Fetch the user profile using the access token
    const profileResponse = await axios.get(`${IG_API_URL}/${user_id}`, {
      params: {
        fields: "id,username,account_type,media_count",
        access_token
      }
    });

    console.log("profile-->", profileResponse);
    const profileData = profileResponse.data;

    // Check if the account is already linked
    let existingAccount = await InstagramAccount.findOne({
      user: req.user.id,
      instagramId: profileData.id
    });

    if (existingAccount) {
      return res
        .status(400)
        .json({ message: "This Instagram account is already linked" });
    }

    // Create and store the new Instagram account
    const newAccount = await InstagramAccount.create({
      user: req.user.id,
      instagramId: profileData.id,
      username: profileData.username,
      fullName: "", // Not provided by the Basic Display API
      profilePicture: "", // Not provided by the Basic Display API
      bio: "",
      website: "",
      followers: 0, // To be updated with additional API calls if needed
      following: 0,
      postsCount: profileData.media_count,
      type: profileData.account_type,
      accessToken: access_token,
      tokenExpiresAt: null, // For long‑lived tokens, adjust as necessary
      connectedAt: new Date()
    });

    res.status(201).json({
      success: true,
      account: {
        id: newAccount._id,
        instagramId: newAccount.instagramId,
        username: newAccount.username,
        fullName: newAccount.fullName,
        profilePicture: newAccount.profilePicture,
        type: newAccount.type
      }
    });
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    next(error);
  }
};

// 3. Get all linked Instagram accounts for the current user
export const getInstagramAccounts = async (req, res, next) => {
  try {
    const accounts = await InstagramAccount.find({ user: req.user.id });
    res.status(200).json({
      success: true,
      accounts: accounts.map((account) => ({
        id: account._id,
        instagramId: account.instagramId,
        username: account.username,
        fullName: account.fullName,
        profilePicture: account.profilePicture,
        bio: account.bio,
        website: account.website,
        followers: account.followers,
        following: account.following,
        postsCount: account.postsCount,
        type: account.type,
        connectedAt: account.connectedAt,
        tokenExpiresAt: account.tokenExpiresAt
      }))
    });
  } catch (error) {
    next(error);
  }
};

// 4. Get Instagram feed (media) by calling the Instagram API and (optionally) storing posts
export const getFeed = async (req, res, next) => {
  try {
    // Verify account belongs to user
    const account = await InstagramAccount.findOne({
      _id: req.params.accountId,
      user: req.user.id
    });
    if (!account)
      return res.status(404).json({ message: "Instagram account not found" });

    // Call Instagram API to fetch media (posts)
    const response = await axios.get(`${IG_API_URL}/me/media`, {
      params: {
        fields: "id,caption,media_type,media_url,permalink,timestamp",
        access_token: account.accessToken
      }
    });

    const postsData = response.data.data;
    // Optionally, you can loop through postsData to update/create Post documents in your DB

    res.status(200).json({
      success: true,
      posts: postsData
    });
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    next(error);
  }
};

// 5. Get Instagram posts (similar to getFeed)
export const getPosts = async (req, res, next) => {
  try {
    const account = await InstagramAccount.findOne({
      _id: req.params.accountId,
      user: req.user.id
    });
    if (!account)
      return res.status(404).json({ message: "Instagram account not found" });

    const response = await axios.get(`${IG_API_URL}/me/media`, {
      params: {
        fields: "id,caption,media_type,media_url,permalink,timestamp",
        access_token: account.accessToken
      }
    });

    const postsData = response.data.data;
    res.status(200).json({
      success: true,
      posts: postsData
    });
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    next(error);
  }
};

// 6. Get Instagram comments for a given post
export const getComments = async (req, res, next) => {
  try {
    const account = await InstagramAccount.findOne({
      _id: req.params.accountId,
      user: req.user.id
    });
    if (!account)
      return res.status(404).json({ message: "Instagram account not found" });

    // postId is expected as a query parameter
    if (!req.query.postId) {
      return res
        .status(400)
        .json({ message: "postId query parameter is required" });
    }
    const postId = req.query.postId;
    const response = await axios.get(`${IG_API_URL}/${postId}/comments`, {
      params: {
        fields: "id,text,timestamp,username",
        access_token: account.accessToken
      }
    });

    const commentsData = response.data.data;
    res.status(200).json({
      success: true,
      comments: commentsData
    });
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    next(error);
  }
};

// 7. Get Instagram analytics (insights) for a Business/Creator account
export const getAnalytics = async (req, res, next) => {
  try {
    const account = await InstagramAccount.findOne({
      _id: req.params.accountId,
      user: req.user.id
    });
    if (!account)
      return res.status(404).json({ message: "Instagram account not found" });

    // Example: get insights for follower count, reach, impressions, and engagement
    const response = await axios.get(`${IG_API_URL}/me/insights`, {
      params: {
        metric: "follower_count,impressions,reach,engagement",
        access_token: account.accessToken
      }
    });

    const insights = response.data.data;
    // Map the response to your desired structure
    const analyticsData = {
      followers:
        insights.find((i) => i.name === "follower_count")?.values[0]?.value ||
        0,
      reach: insights.find((i) => i.name === "reach")?.values[0]?.value || 0,
      impressions:
        insights.find((i) => i.name === "impressions")?.values[0]?.value || 0,
      engagement:
        insights.find((i) => i.name === "engagement")?.values[0]?.value || 0
    };

    res.status(200).json({
      success: true,
      analytics: analyticsData
    });
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    next(error);
  }
};

// 8. Direct messages integration is not available via the Instagram API at this time.
export const getMessages = async (req, res, next) => {
  res.status(501).json({
    message: "Instagram messages integration is not supported via the API"
  });
};
