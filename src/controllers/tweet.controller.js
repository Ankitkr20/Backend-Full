import mongoose, { isValidObjectId, mongo } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;
  if (!req.user) {
    throw new ApiError(401, "You need to Login First");
  }
  if (!content || content.trim() === "") {
    throw new ApiError(400, "Content is Required");
  }
  const tweet = await Tweet.create({
    user: req.user._id,
    content,
  });

  return res.status(201).json(new ApiResponse(201, tweet, "Tweet is Created"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;
  // adding pagination and sorting
  const { page = 1, limit = 10 } = req.query;

  if (!req.user) {
    throw new ApiError(401, "You need to Login First");
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid Tweet Id");
  }
  if (userId !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to get the Tweets");
  }
  const tweets = await Tweet.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  if (!tweets || tweets.length === 0) {
    throw new ApiError(404, "Tweets not Found");
  }

  const totalTweets = await Tweet.countDocuments({ user: userId });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        tweets,
        currentPage: Number(page),
        totalPages: Math.ceil(totalTweets / limit),
        totalTweets,
      },
      "Tweet fetched Successfully"
    )
  );
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { userId, tweetId } = req.params;
  const { content } = req.body;
  if (!req.user) {
    throw new ApiError(401, "You need to Login First");
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid User Id");
  }
  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(400, "Invalid Tweet Id");
  }
  if (userId !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this Tweet");
  }
  const tweet = await Tweet.findOneAndUpdate(
    { user: req.user._id, _id: tweetId },
    { content },
    { new: true }
  );
  if (!tweet) {
    throw new ApiError(404, "Tweet not Found");
  }
  return res.status(200).json(new ApiResponse(200, tweet, "Tweet Updated"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;
  if (!req.user) {
    throw new ApiError(401, "You need to Login First");
  }

  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(400, "Invalid Tweet Id");
  }

  const tweet = await Tweet.findOneAndDelete({
    user: req.user._id,
    _id: tweetId,
  });
  if (!tweet) {
    throw new ApiError(404, "Tweet not Found or Unauthorized");
  }

  return res.status(200).json(new ApiResponse(200, tweet, "Tweet is Deleted"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
