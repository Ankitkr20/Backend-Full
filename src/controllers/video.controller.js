import mongoose, { isValidObjectId, mongo } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  let {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
  } = req.query;
  const { userId } = req.params;

  // Convert page and limit to numbers and validate
  page = Number(page);
  limit = Number(limit);
  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 10;

  if (!req.user) {
    throw new ApiError(401, "You need to Login First");
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid User Id");
  }
  if (userId !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to get Videos");
  }

  // Build filter (only published videos)
  const filter = { user: userId, isPublished: true };
  if (query) {
    filter.title = { $regex: query, $options: "i" };
  }

  // Build sort options
  const sortOptions = {};
  sortOptions[sortBy] = sortType === "asc" ? 1 : -1;

  // Fetch videos with pagination and sorting
  const videos = await Video.find(filter)
    .sort(sortOptions)
    .skip((page - 1) * limit)
    .limit(limit);

  if (!videos || videos.length === 0) {
    throw new ApiError(404, "Videos not found");
  }

  const totalVideos = await Video.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videos,
        currentPage: page,
        totalPages: Math.ceil(totalVideos / limit),
        totalVideos,
      },
      "Videos Fetched Successfully"
    )
  );
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const { videoId } = req.params;
  // TODO: get video, upload to cloudinary, create video
  if (!req.user) {
    throw new ApiError(401, "You need to Login First");
  }
  if (!title?.trim()) {
    throw new ApiError(400, "Title is Required");
  }
  if (!description?.trim()) {
    throw new ApiError(400, "Description is Required");
  }
  const video = await Video.findOneAndUpdate(
    { _id: videoId, user: req.user._id },
    { title, description, isPublished: true },
    {
      new: true /*select : "title description isPublished" } it will only return selected field in the json response */,
    }
  );
  if (!video) {
    throw new ApiError(404, "Video not Found or You are not authorized");
  }

  return res.status(200).json(new ApiResponse(200, video, "Video Published"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  if (!req.user) {
    throw new ApiError(401, "You need to Login First");
  }
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid Video Id");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not Found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched Successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  //TODO: update video details like title, description, thumbnail
  const { videoId, userId } = req.params;
  const { title, description, thumbnail } = req.body;
  if (!req.user) {
    throw new ApiError(401, "You need to Login First");
  }
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid Video Id");
  }
  if (!title || title.trim() === "") {
    throw new ApiError(400, "Title is Required");
  }
  if (!description || description.trim() === "") {
    throw new ApiError(400, "Description is Required");
  }
  if (!thumbnail || thumbnail.trim() === "") {
    throw new ApiError(400, "Thumbnail is Required");
  }
  if (userId !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to Update Video");
  }
  const video = await Video.findOneAndUpdate(
    { user: req.user._id, _id: videoId },
    { title, description, thumbnail },
    { new: true }
  );
  if (!video) {
    throw new ApiError(404, "Video not Found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video Updated Successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  if (!req.user) {
    throw new ApiError(401, "You need to Login First");
  }
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invaid Video Id");
  }

  const video = await Video.findOneAndDelete({
    _id: videoId,
    user: req.user._id,
  });
  if (!video) {
    throw new ApiError(
      404,
      "Video not found or You are not allowed to delete it"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video Deleted Successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!req.user) {
    throw new ApiError(401, "You need to Login First");
  }
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid Video Id");
  }

  const video = await Video.findOne({
    _id: videoId,
    user: req.user._id,
  });
  if (!video) {
    throw new ApiError(404, "Video not Found or You are not authorized");
  }

  video.isPublished = !video.isPublished;
  await video.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isPublished: video.isPublished },
        `Video ${video.isPublished ? "Published" : "Unpublished"} Successfully`
      )
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
