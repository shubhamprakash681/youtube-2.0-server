import express from "express";
import { isAuthenticatedUser } from "../middlewares/Auth.middleware";
import {
  getSubscribedChannels,
  toggleChannelSubscription,
} from "../controllers/subscription.controllers";

const subscriptionRouter = express.Router();

subscriptionRouter.use(isAuthenticatedUser);

subscriptionRouter.route("/channel/:channelId").post(toggleChannelSubscription);
subscriptionRouter.route("/user/:userId").get(getSubscribedChannels);

export default subscriptionRouter;
