import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const healthcheck = asyncHandler(async (req, res) => {
    //TODO: build a healthcheck response that simply returns the OK status as json with a message
    if(!req.user){
        throw new ApiError(401,"You are not logged in.")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,{userId:req.user._id},"You are Ok"))
    
})

export {
    healthcheck
    }
    