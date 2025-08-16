import mongoose, { isValidObjectId, mongo } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { application } from "express";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  //TODO: create playlist

  if (!req.user) {
    throw new ApiError(401, "You need to login first");
  }
  if (!name || name.trim() === "") {
    throw new ApiError(400, "Name cannot be empty");
  }
  if (!description || description.trim() === "") {
    throw new ApiError(400, "Description cannot be empty");
  }

  const existingPlaylist = await Playlist.findOne({
    name: name.trim(),
    user: req.user._id,
  });
  if (existingPlaylist) {
    throw new ApiError(
      400,
      "You cannot create another playlist with same name"
    );
  }

  const createdPlaylist = await Playlist.create({
    name,
    description,
    user: req.user._id,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, createdPlaylist, "Playlist Created Successfully")
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  if(!req.user){
    throw new ApiError(401,"You need to Login First")
  }
  if(!mongoose.Types.ObjectId.isValid(userId)){
    throw new ApiError(400,"Invalid User Id")
  }
  const playlist = await Playlist.find({user: userId})
  if(!playlist || playlist.length === 0){
    throw new ApiError(404,"Playlist not Found for this User")
  }
  if(userId !== req.user._id.toString()){
    throw new ApiError(403,"You are not allowed to get Playlist")
  }

  return res
  .status(200)
  .json(new ApiResponse(200, playlist,"Playlist fetched Successfully"))
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  if(!req.user){
    throw new ApiError(401,"You need to login first")
  }
  if(!mongoose.Types.ObjectId.isValid(playlistId)){
    throw new ApiError(400,"Invalid Playlist ID")
  }
  const gotPlaylistById = await Playlist.findById(playlistId)

  if(!gotPlaylistById){
    throw new ApiError(404,"Playlist not Found")
  }

  if(gotPlaylistById.user.toString() !== req.user._id.toString()){
    throw new ApiError(403,"You are not allowed to get this Playlist")
  }

  return res
  .status(200)
  .json(new ApiResponse(200,gotPlaylistById,"Got Playlist by ID"))
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if(!req.user){
    throw new ApiError(401, "You need to login first")
  }
  if(!mongoose.Types.ObjectId.isValid(playlistId)){
    throw new ApiError(400,"Not a valid Playlist ID")
  }
  if(!mongoose.Types.ObjectId.isValid(videoId)){
    throw new ApiError(400,"Not a valid Video ID")
  }

  const playlist = await Playlist.findById(playlistId)
  if(!playlist){
    throw new ApiError(404,"Playlist not Found")
  }

  if(playlist.user.toString() !== req.user._id.toString()){
    throw new ApiError(403,"You are not allowed to add video to this Playlist")
  }
  playlist.videos.addToSet(videoId)
  await playlist.save()

  return res
  .status(200)
  .json(new ApiResponse(200,playlist,"You added Video Successfully"))

});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  if(!req.user){
    throw new ApiError(401,"You need to Login First")
  }

  if(!mongoose.Types.ObjectId.isValid(videoId)){
    throw new ApiError(400,"Invalid Video ID")
  }

  if(!mongoose.Types.ObjectId.isValid(playlistId)){
    throw new ApiError(400,"Invalid Playlist ID")
  }

  const playlist = await Playlist.findById(playlistId)
  if(!playlist){
    throw new ApiError(404,"Playlist not found")
  }

  if(playlist.user.toString() !== req.user._id.toString()){
    throw new ApiError(403,"You are not allowed to Delete the video")
  }
  
  playlist.videos.pull(videoId)
  await playlist.save()

  return res
  .status(200)
  .json(new ApiResponse(200, playlist,"Video Removed Successfully"))
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  if(!req.user){
    throw new ApiError(401,"You need to Login First")
  }
  if(!mongoose.Types.ObjectId.isValid(playlistId)){
    throw new ApiError(400,"Invalid Playlist Id")
  }

  const playlist = await Playlist.findById(playlistId)
  if(!playlist){
    throw new ApiError(404,"Playlist not found")
  }

  if(playlist.user.toString() !== req.user._id.toString()){
    throw new ApiError(403,"You are not allowed to Delete this Playlist")
  }

  await Playlist.findByIdAndDelete(playlistId)

  return res
  .status(200)
  .json(new ApiResponse(200, playlist, "Playlist Deleted Successfully"))
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
  if(!req.user){
    throw new ApiError(401,"You need to Login First")
  }
  if(!mongoose.Types.ObjectId.isValid(playlistId)){
    throw new ApiError(400,"Invalid Playlist Id")
  }
  if(!name || name.trim() === ""){
    throw new ApiError(403,"Name is Required")
  }
  if(!description || description.trim() === ""){
    throw new ApiError(403,"Description is Required")
  }
  const playlist = await Playlist.findById(playlistId)
  if(!playlist){
    throw new ApiError(404,"Playlist not Found")
  }
  if(playlist.user.toString() !== req.user._id.toString()){
    throw new ApiError(403,"You are not allowed to Update the Playlist")
  }
  const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId,
    {name,description},{new: true})

  return res
  .status(200)
  .json(new ApiResponse(200, updatedPlaylist,"Playlist Updated Successfully"))
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
