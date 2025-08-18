import mongoose, { Aggregate } from "mongoose";
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username?.trim()) {
    throw new ApiError(400, "Invalid username");
  }

  const channel = await User.aggregate([
    {
      $match: { username: username.toLowerCase() },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribed",
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "channel",
        as: "videos",
      },
    },
    {
      $addFields: {
        subscriberCounts: { $size: "$subscribers" },
        subscribedCounts: { $size: "$subscribed" },
        videoCounts: { $size: "$videos" },

        // ✅ Fix: sum of views
        videoViewsCounts: { $sum: "$videos.views" },

        videoStats: {
          $map: {
            input: "$videos",
            as: "vid",
            in: {
              _id: "$$vid._id",
              title: "$$vid.title",
              views: "$$vid.views",
              likeCount: { $size: { $ifNull: ["$$vid.likes", []] } },
              commentCount: { $size: { $ifNull: ["$$vid.comments", []] } },
            },
          },
        },

        likeCounts: {
          $sum: {
            $map: {
              input: "$videos",
              as: "vid",
              in: { $size: { $ifNull: ["$$vid.likes", []] } },
            },
          },
        },
        commentCounts: {
          $sum: {
            $map: {
              input: "$videos",
              as: "vid",
              in: { $size: { $ifNull: ["$$vid.comments", []] } },
            },
          },
        },

        // ✅ Fix: compare userId with array of subscriber IDs
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
        isSubscribed: 1,
        subscriberCounts: 1,
        subscribedCounts: 1,
        videoCounts: 1,
        videoViewsCounts: 1,
        likeCounts: 1,
        commentCounts: 1,
        videoStats: 1,
      },
    },
  ]);

  if (!channel.length) {
    throw new ApiError(404, "Channel not Found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "Channel stats fetched Successfully")
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const { channelId } = req.params;
  if (!req.user) {
    throw new ApiError(401, "You need to Login First");
  }
  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid Channel Id");
  }
  const channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel not Found");
  }
  if (channel._id.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "You are not authorized to access this channel's videos"
    );
  }

  const channelVideos = await Video.find({ channel: channelId });

  if (channelVideos.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No Video Uploaded to this Channel"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, channelVideos, "All channel Videos Fetched"));
});

export { getChannelStats, getChannelVideos };
