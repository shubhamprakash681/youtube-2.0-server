import express from "express";
import {
  getUserProfile,
  loginUser,
  logoutUser,
  refreshSession,
  registerUser,
  updatePassword,
  updateProfile,
  updateUserAvatar,
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
userRouter.route("/refresh-session").post(refreshSession);

// secured user routes
userRouter.route("/profile").get(isAuthenticatedUser, getUserProfile);
userRouter.route("/profile/update").post(isAuthenticatedUser, updateProfile);
userRouter
  .route("/avatar/update")
  .post(
    uploadFileInServer.single("avatar"),
    isAuthenticatedUser,
    updateUserAvatar
  );
userRouter.route("/password/update").post(isAuthenticatedUser, updatePassword);
userRouter.route("/logout").get(isAuthenticatedUser, logoutUser);

export default userRouter;
