import { NextFunction, Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import VideoModel from "../models/videoModel";

export const addComment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { content } = req.body as { content: string };
    const { videoId } = req.params;

    // const video = await VideoModel
  }
);
