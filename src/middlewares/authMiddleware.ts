import { NextFunction, Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import ErrorHandler from "../utils/ErrorHandler";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import UserModel from "../models/userModel";

export const isAuthenticatedUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // reading token from req.cookies or req.header
    const token =
      req.cookies.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return next(
        new ErrorHandler("Unauthorized request", StatusCodes.UNAUTHORIZED)
      );
    }

    const decodedUser = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as unknown as { _id: string };

    const user = await UserModel.findById(decodedUser._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return next(
        new ErrorHandler("Invalid Access Token", StatusCodes.UNAUTHORIZED)
      );
    }

    req.user = user;
    next();
  }
);
