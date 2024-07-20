import express from "express";
import { registerUser } from "../controllers/userControllers";
import { uploadFileInServer } from "../middlewares/multer";

const userRouter = express.Router();

userRouter.route("/register").post(
  uploadFileInServer.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

export default userRouter;
