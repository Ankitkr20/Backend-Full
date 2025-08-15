import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(401,"Invalid Video ID")
    }
    const comments = await Comment
    .find({video: videoId})
    .populate("username","avatar")
    .sort({createdAt: -1})
    .skip((page-1)*limit)
    .limit(Number(limit))

    const totalComments = await Comment.countDocuments({video: videoId})

    return res
    .status(200)
    .json(200,{
        comments,
        totalComments,
        page: Number(page),
        pages: Math.ceil(totalComments/limit)
    },"Comments Fetched Successfully")

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    if(!req.user){
        throw new ApiError(401, "You need to log in first")
    }

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }