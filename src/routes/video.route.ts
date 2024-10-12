import express from "express";
import { getAllVideos, uploadVideo } from "../controllers/video.controller";
import { isAuthenticatedUser } from "../middlewares/Auth.middleware";
import { uploadFileInServer } from "../middlewares/Multer.middleware";

const videoRouter = express.Router();

videoRouter.route("/").get(getAllVideos);

videoRouter.route("/upload").post(
  isAuthenticatedUser,
  uploadFileInServer.fields([
    {
      name: "video",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  uploadVideo
);

export default videoRouter;
