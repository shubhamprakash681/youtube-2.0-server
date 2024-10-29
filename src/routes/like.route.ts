import express from "express";
import {
  getLikedVideos,
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
} from "../controllers/like.controllers";
import { isAuthenticatedUser } from "../middlewares/Auth.middleware";

const likeRouter = express.Router();
likeRouter.use(isAuthenticatedUser);

likeRouter.route("/video/:videoId").post(toggleVideoLike);
likeRouter.route("/comment/:commentId").post(toggleCommentLike);
likeRouter.route("/tweet/:tweetId").post(toggleTweetLike);
likeRouter.route("/videos").get(getLikedVideos);

export default likeRouter;
