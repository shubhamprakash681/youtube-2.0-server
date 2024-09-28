import express from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/userControllers";
import { uploadFileInServer } from "../middlewares/multer";
import { isAuthenticatedUser } from "../middlewares/authMiddleware";

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
userRouter.route("/login").post(loginUser);

// secured user routes
userRouter.route("/logout").get(isAuthenticatedUser, logoutUser);

export default userRouter;
