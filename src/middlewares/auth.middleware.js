import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js";

export const verifyJWT = asyncHandler(async(req, _, next)=>{
    let token = null;

    // 1. Try getting token from cookie
    if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }
  
    // 2. Try getting token from Authorization header
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
  
    if (!token) {
      throw new ApiError(401, "Unauthorized: No token provided")
    }

    try{
        console.log("header token",req.headers.authorization)
        console.log("cookies:",req.cookies)
        console.log("token recieved",token)
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        
        if(!user){
            throw new ApiError(401,"Invalid Access Token")
        }
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid AccessToken")
    }
})