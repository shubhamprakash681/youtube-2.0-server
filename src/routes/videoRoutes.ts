import { isAuthenticatedUser } from "../middlewares/authMiddleware";
import { uploadVideo } from "../controllers/videoController";
import express from "express";
import { uploadFileInServer } from "../middlewares/multer";

const videoRouter = express.Router();

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
