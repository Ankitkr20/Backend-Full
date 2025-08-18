import mongoose, { isValidObjectId, mongo } from "mongoose";
import { Like } from "../models/like.models.js";
import { Video } from "../models/video.models.js";
import { Tweet } from "../models/tweets.models.js";
import { Comment } from "../models/comment.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  if (!req.user) {
    throw new ApiError(401, "You need to login first");
  }
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
  }

  // check if user already liked the video
  const existingLike = await Like.findOne({
    video: videoId,
    user: req.user._id,
  });

  if (existingLike) {
    // unlike
    await existingLike.deleteOne();

    return res
      .status(200)
      .json(new ApiResponse(200, { liked: false }, "You Unliked this Video"));
  }
  // like
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  await Like.create({
    video: videoId,
    user: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { liked: true }, "You Liked this Video"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  if (!req.user) {
    throw new ApiError(401, "You need to login first");
  }

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid Comment ID");
  }

  const existingLike = await Like.findOne({
    comment: commentId,
    user: req.user._id,
  });
  if (existingLike) {
    await existingLike.deleteOne();

    return res
      .status(200)
      .json(new ApiResponse(200, { liked: false }, "Comment Unliked"));
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  await Like.create({
    comment: commentId,
    user: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { liked: true }, "Comment Liked"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  if (!req.user) {
    throw new ApiError(401, "You need to login first");
  }
  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(400, "Invalid Tweet ID");
  }
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }
  const existingLike = await Like.findOne({
    tweet: tweetId,
    user: req.user._id,
  });
  if (existingLike) {
    await existingLike.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, { liked: false }, "You Unliked this Tweet"));
  } else {
    await Like.create({
      tweet: tweetId,
      user: req.user._id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, { liked: true }, "You Liked this Tweet"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
