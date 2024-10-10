import { Request, Response, NextFunction } from "express";
import AsyncHandler from "../utils/AsyncHandler";
import ErrorHandler from "../utils/ErrorHandler";
import { StatusCodes } from "http-status-codes";
import User from "../models/User.model";
import jwt from "jsonwebtoken";

export const isAuthenticatedUser = AsyncHandler(
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

    const user = await User.findById(decodedUser._id).select(
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
