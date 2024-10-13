import express from "express";
import { isAuthenticatedUser } from "../middlewares/Auth.middleware";
import {
  getChannelStats,
  getChannelVideos,
} from "../controllers/dashboard.controllers";

const dashboardRouter = express.Router();

dashboardRouter.route("/stats").get(isAuthenticatedUser, getChannelStats);
dashboardRouter.route("/videos").get(isAuthenticatedUser, getChannelVideos);

export default dashboardRouter;
