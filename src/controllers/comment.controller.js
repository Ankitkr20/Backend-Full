import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(401, "Invalid Video ID");
  }
  const comments = await Comment.find({ video: videoId })
    .populate("user", "name avatar")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const totalComments = await Comment.countDocuments({ video: videoId });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        comments,
        totalComments,
        page: Number(page),
        pages: Math.ceil(totalComments / limit),
      },
      "Comments Fetched Successfully"
    )
  );
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  if (!req.user) {
    throw new ApiError(401, "You need to log in first");
  }
  const { videoId } = req.params;
  const { content } = req.body;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
  }
  if (!content || content.trim() === "") {
    throw new ApiError(400, "Comment content is required");
  }
  const comment = await Comment.create({
    video: videoId,
    user: req.user._id,
    content,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  if (!req.user) {
    throw new ApiError(401, "You need to login first");
  }
  const { commentId } = req.params;
  const { content } = req.body;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid Comment ID");
  }
  if (!content || content.trim() === "") {
    throw new ApiError(400, "Content is Required");
  }

  const updatedComment = await Comment.findOneAndUpdate(
    {_id:commentId, user: req.user._id}, // ownership check
    { content },
    { new: true }
  ).populate("user", "name avatar");
  
  if(!updatedComment){
    throw new ApiError(404,"Comment not found or you are not allowed to edit it")
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Comment Updated Successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  if (!req.user) {
    throw new ApiError(401, "You need to login first");
  }
  const { commentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid Comment ID");
  }

  const deletedComment = await Comment.findOneAndDelete(
    {_id:commentId,
    user: req.user._id}
  )
  if(!deletedComment){
    throw new ApiError(404,"Comment not found or you are not allowed to delete it")
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Comment is Deleted Successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
