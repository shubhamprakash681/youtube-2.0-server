import asyncHandler from "../utils/asyncHandler";
import VideoModel, { IVideo } from "../models/videoModel";
import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import { StatusCodes } from "http-status-codes";
import { uploadOnCloudinary } from "../utils/cloudinary";
import APIResponse from "../utils/APIResponse";
import mongoose, { PipelineStage } from "mongoose";

type getAllVideosQuery = {
  page: number;
  limit: number;
  query: string;
  sortBy: keyof IVideo;
  sortType: "asc" | "des";
  userId: string;
};

// TODO: pipeline not running if query is there
export const getAllVideos = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      page = 1,
      limit = 10,
      query,
      sortBy,
      sortType = "asc",
      userId,
    } = req.query as unknown as getAllVideosQuery;

    const pipeline: PipelineStage[] = [];

    if (query) {
      pipeline.push({
        $search: {
          index: "video-search-index",
          text: {
            query,
            path: ["title", "description"],
            fuzzy: {
              maxEdits: 2,
              prefixLength: 0,
              maxExpansions: 50,
            },
          },
        },
      });
    }

    // pipeline for fetching public videos only
    pipeline.push({
      $match: { isPublic: true },
    });

    // send userId with req.query if want to get videos of specific user only
    if (userId) {
      pipeline.push({
        $match: {
          owner: new mongoose.Types.ObjectId(userId),
        },
      });
    }

    if (sortBy && sortType) {
      pipeline.push({
        $sort: {
          [sortBy]: sortType === "des" ? -1 : 1,
        },
      });
    } else {
      // default sorting by creation date
      pipeline.push({
        $sort: {
          createdAt: -1,
        },
      });
    }

    // lookup for populating owner data
    pipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
          pipeline: [
            {
              $project: {
                fullname: 1,
                username: 1,
                avatar: "$avatar.url",
              },
            },
          ],
        },
      },

      {
        $unwind: {
          path: "$owner",
        },
      }
    );

    // console.log(pipeline);

    const videoAggregate = VideoModel.aggregate(pipeline);

    const videos = await VideoModel.aggregatePaginate(videoAggregate, {
      page,
      limit,
    });

    res
      .status(StatusCodes.OK)
      .json(
        new APIResponse(StatusCodes.OK, "Video fetched successfully", videos)
      );
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
