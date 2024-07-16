import { ApiError } from "./ApiError.js";
import { User } from "../models/user-model.js";

export const generateAccessAndRefreshTken = async ({userId}) => {
  
    try {
  
      const user = await User.findById(userId)
  
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();
  
      user.refreshToken = refreshToken
      await user.save({validateBeforeSave: false})
  
      return {accessToken, refreshToken}
  
    } catch (error) {
      throw new ApiError(500, error?.message || "Something went wrong while generating Refresh and Access token")
    }
  }