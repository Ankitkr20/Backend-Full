import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription
  if (!req.user) {
    throw new ApiError(401, "You need to login first");
  }
  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid Channel Id");
  }
  const existingSubscriber = await Subscription.findOne({
    user: req.user._id,
    channel: channelId,
  });
  if (existingSubscriber) {
    await existingSubscriber.deleteOne();

    return res
      .status(200)
      .json(new ApiResponse(200, { subscribed: false }, "Unsubscribed"));
  }

  await Subscription.create({ user: req.user._id, channel: channelId });

  return res
    .status(200)
    .json(new ApiResponse(200, { subscribed: true }, "Subscribed"));
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if(!req.user){
    throw new ApiError(401, "You need to Login First")
  }
  if(!mongoose.Types.ObjectId.isValid(channelId)){
    throw new ApiError(400,"Invalid Channel Id")
  }
  const subscribers = await Subscription.find({channel: channelId})
  .populate("subscriber","username avatar")

  if(subscribers.length === 0){
    throw new ApiError(404,"Subscriber not Found")
  }

  return res
  .status(200)
  .json((new ApiResponse(200, subscribers,"These are the subscribers")))
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if(!req.user){
    throw new ApiError(401,"You need to Login First")
  }
  if(!mongoose.Types.ObjectId.isValid(subscriberId)){
    throw new ApiError(400,"Invalid Subscriber Id")
  }
  const subscribed = await Subscription.find({subscriber: subscriberId})
  .populate("channel","username avatar")

  if(subscribed.length === 0){
    return res
    .status(200)
    .json(new ApiResponse(200,[],"No Subscribed channel yet"))
  }

  return res
  .status(200)
  .json(new ApiResponse(200,subscribed,"Subscribed Channels Fetched"))
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
