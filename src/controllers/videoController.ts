import asyncHandler from "../utils/asyncHandler";
import VideoModel, { IVideo } from "../models/videoModel";
import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import { StatusCodes } from "http-status-codes";
import { uploadOnCloudinary } from "../utils/cloudinary";
import APIResponse from "../utils/APIResponse";

type getAllVideosQuery = {
  page: number;
  limit: number;
  query: string;
  sortBy: keyof IVideo;
  sortType: "asc" | "des";
  userId: string;
};
export const getAllVideos = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  }
);

export const uploadVideo = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { title, description } = req.body as {
      title: string;
      description: string;
    };

    if (
      [title, description].some(
        (field) => typeof field !== "string" || field.trim() === ""
      )
    ) {
      return next(
        new ErrorHandler("All fields are required!", StatusCodes.BAD_REQUEST)
      );
    }

    const files = req.files as { [fieldName: string]: Express.Multer.File[] };
    const video = files["video"]?.at(0);
    const thumbnail = files["thumbnail"]?.at(0);

    if (!video) {
      return next(
        new ErrorHandler("Video File is required!", StatusCodes.BAD_REQUEST)
      );
    }
    if (!thumbnail) {
      return next(
        new ErrorHandler(
          "Thumbnail Image is required!",
          StatusCodes.BAD_REQUEST
        )
      );
    }

    const videoCloudRes = await uploadOnCloudinary(
      video.path,
      `video/${req.user?.username}`
    );
    const thumbnailCloudRes = await uploadOnCloudinary(
      thumbnail.path,
      `thumbnail/${req.user?.username}`
    );

    if (!videoCloudRes || !thumbnailCloudRes) {
      return next(
        new ErrorHandler(
          "Video Upload Failed! Please try after some time.",
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    }

    const videoDoc = await VideoModel.create({
      title,
      description,
      videoFile: {
        public_id: videoCloudRes.public_id,
        url: videoCloudRes.url,
      },
      thumbnail: {
        public_id: thumbnailCloudRes.public_id,
        url: thumbnailCloudRes.url,
      },
      duration: videoCloudRes.duration,
      owner: req.user?._id,
    });

    const videoData = await VideoModel.findById(videoDoc._id);
    if (!videoData) {
      return next(
        new ErrorHandler(
          "Video upload failed! Please try again after some time",
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    }

    res.status(StatusCodes.CREATED).json(
      new APIResponse(StatusCodes.CREATED, "Video uploaded successfully", {
        video: videoData,
      })
    );
  }
);
