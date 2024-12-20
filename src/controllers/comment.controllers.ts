import { NextFunction, Request, Response } from "express";
import AsyncHandler from "../utils/AsyncHandler";
import { addCommentValidator } from "../schema/comment";
import ErrorHandler from "../utils/ErrorHandler";
import { StatusCodes } from "http-status-codes";
import Video from "../models/Video.model";
import Comment from "../models/Comment.model";
import APIResponse from "../utils/APIResponse";
import Like from "../models/Like.model";
import { ObjectId } from "mongodb";

export const addVideoComment = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { videoId } = req.params as { videoId: string };
    const { content } = req.body as { content: string };

    const validationRes = addCommentValidator.safeParse({ content });

    if (!validationRes.success) {
      const validationErrors = validationRes.error.errors.map(
        (err) => err.message
      );

      return next(
        new ErrorHandler(
          validationErrors.length
            ? validationErrors.join(", ")
            : "Invalid query parameter",
          StatusCodes.BAD_REQUEST
        )
      );
    }

    const video = await Video.findById(videoId);
    if (!video) {
      return next(new ErrorHandler("Video Not Found!!", StatusCodes.NOT_FOUND));
    }

    const comment = await Comment.create({
      content,
      video: videoId,
      owner: req.user?._id,
    });

    if (!comment) {
      return next(
        new ErrorHandler(
          "Comment Add Failed! Please try again after some time.",
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    }

    res
      .status(StatusCodes.CREATED)
      .json(new APIResponse(StatusCodes.CREATED, "Comment added successfully"));
  }
);

export const updateComment = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { commentId } = req.params as { commentId: string };
    const { content } = req.body as { content: string };

    const validationRes = addCommentValidator.safeParse({ content });

    if (!validationRes.success) {
      const validationErrors = validationRes.error.errors.map(
        (err) => err.message
      );

      return next(
        new ErrorHandler(
          validationErrors.length
            ? validationErrors.join(", ")
            : "Invalid query parameter",
          StatusCodes.BAD_REQUEST
        )
      );
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return next(
        new ErrorHandler("Comment not found!", StatusCodes.NOT_FOUND)
      );
    }

    if (
      !req.user?._id ||
      comment.owner.toString() !== req.user?._id.toString()
    ) {
      return next(
        new ErrorHandler(
          "You are not authorised to access this content",
          StatusCodes.UNAUTHORIZED
        )
      );
    }

    comment.content = content;
    await comment.save();

    res
      .status(StatusCodes.OK)
      .json(new APIResponse(StatusCodes.OK, "Comment updated successfully."));
  }
);

export const deleteComment = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { commentId } = req.params as { commentId: string };

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return next(
        new ErrorHandler("Comment Not Found!", StatusCodes.NOT_FOUND)
      );
    }

    if (
      !req.user?._id ||
      comment.owner.toString() !== req.user?._id.toString()
    ) {
      return next(
        new ErrorHandler(
          "You are not authorised to access this content",
          StatusCodes.UNAUTHORIZED
        )
      );
    }

    await Comment.findByIdAndDelete(commentId);
    await Like.deleteMany({
      likedBy: req.user._id,
      comment: commentId,
    });

    res
      .status(StatusCodes.OK)
      .json(new APIResponse(StatusCodes.OK, "Comment deleted successfully"));
  }
);

export const getAllVideoComments = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { videoId } = req.params as { videoId: string };
    const { page = 1, limit = 15 } = req.query as unknown as {
      page: number;
      limit: number;
    };

    const video = await Video.findById(videoId);
    if (!video) {
      return next(new ErrorHandler("Video Not Found", StatusCodes.NOT_FOUND));
    }

    const commentAggregate = Comment.aggregate([
      // stage 1 - for filtering out comments for specific videos
      {
        $match: {
          video: new ObjectId(videoId),
        },
      },

      // stage 2 - populating owner data
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
        },
      },

      // stage 3- for populating comment likes
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "comment",
          as: "likes",
        },
      },

      // stage 4 - sorting
      {
        $sort: {
          createdAt: -1,
        },
      },

      // stage 5 - adding totalLikesCount & isLiked for each comment
      {
        $addFields: {
          owner: {
            $first: "$owner",
          },
          totalLikesCount: {
            $size: "$likes",
          },

          isLiked: {
            $cond: {
              if: {
                $in: ["", "$likes.likedBy"],
              },
              then: true,
              else: false,
            },
          },
        },
      },

      // stage 6 - projection stage
      {
        $project: {
          "owner.fullname": 1,
          "owner.username": 1,
          "owner.avatar.url": 1,

          createdAt: 1,
          updatedAt: 1,
          content: 1,
          totalLikesCount: 1,
          isLiked: 1,
        },
      },
    ]);

    const comments = await Comment.aggregatePaginate(commentAggregate, {
      page,
      limit,
    });

    res
      .status(StatusCodes.OK)
      .json(
        new APIResponse(
          StatusCodes.OK,
          "Video Comments fetched successfully",
          comments
        )
      );
  }
);
