import { NextFunction, Request, Response } from "express";
import AsyncHandler from "../utils/AsyncHandler";
import Video from "../models/Video.model";
import { ObjectId } from "mongodb";
import Subscription from "../models/Subscription.model";
import { StatusCodes } from "http-status-codes";
import APIResponse from "../utils/APIResponse";

// Get the personal channel stats like total video views, total subscribers, total videos, total likes etc.
export const getChannelStats = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;

    const videoStats = await Video.aggregate([
      // statge 1- filter videos based on user id
      {
        $match: {
          owner: new ObjectId(userId as string),
        },
      },

      // stage 2- lookup for populating likes
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "video",
          as: "likes",
        },
      },
      {
        $addFields: {
          likes: { $size: "$likes" },
        },
      },

      // stage 3 -
      {
        $group: {
          _id: null,

          totalLikes: { $sum: "$likes" },
          totalViews: { $sum: "$views" },
          totalVideos: { $sum: 1 },
        },
      },
    ]);

    const subscriptionStats = await Subscription.aggregate([
      // statge 1- filter subscriptions based on user id
      {
        $match: {
          channel: new ObjectId(userId as string),
        },
      },

      {
        $group: {
          _id: null,
          totalSubscribers: {
            $sum: 1,
          },
        },
      },
    ]);

    res.status(StatusCodes.OK).json(
      new APIResponse(
        StatusCodes.OK,
        "Your Channel Stats fetched successfully",
        {
          totalLikes: videoStats[0]?.totalLikes || 0,
          totalViews: videoStats[0]?.totalViews || 0,
          totalVideos: videoStats[0]?.totalVideos || 0,
          totalSubscribers: subscriptionStats[0]?.totalSubscribers || 0,
        }
      )
    );
  }
);

// Get all the videos uploaded by the channel
export const getChannelVideos = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { limit = 15, page = 1 } = req.query as unknown as {
      limit: number;
      page: number;
    };

    const videoAggregate = Video.aggregate([
      // stage 1 - filter all videos uploaded by current user
      {
        $match: {
          owner: new ObjectId(req.user?._id as string),
        },
      },

      // stage 2 & 3 - get total likes on each video
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "video",
          as: "likes",
        },
      },
      {
        $addFields: {
          likeCount: {
            $size: "$likes",
          },
        },
      },

      // stage 4 & 5 - get total comments on each video
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "video",
          as: "comments",
        },
      },
      {
        $addFields: {
          commentCount: {
            $size: "$comments",
          },
        },
      },

      // stage 6 - exclusive projection for removing extra fields
      {
        $project: {
          likes: 0,
          comments: 0,
        },
      },

      // stage 7 - sort by createdAt in desc order
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    const videos = await Video.aggregatePaginate(videoAggregate, {
      limit,
      page,
    });

    res
      .status(StatusCodes.OK)
      .json(
        new APIResponse(
          StatusCodes.OK,
          "All videos uploaded by your channel fetched successfully",
          { ...videos }
        )
      );
  }
);
