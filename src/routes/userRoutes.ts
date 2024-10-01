import express from "express";
import {
  deleteCoverImage,
  getUserProfile,
  loginUser,
  logoutUser,
  refreshSession,
  registerUser,
  updatePassword,
  updateProfile,
  updateUserAvatar,
  updateUserCoverImage,
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
userRouter.route("/profile/update").patch(isAuthenticatedUser, updateProfile);
userRouter
  .route("/avatar/update")
  .patch(
    uploadFileInServer.single("avatar"),
    isAuthenticatedUser,
    updateUserAvatar
  );
userRouter
  .route("/cover-image/update")
  .patch(
    uploadFileInServer.single("coverImage"),
    isAuthenticatedUser,
    updateUserCoverImage
  );
userRouter
  .route("/cover-image/delete")
  .delete(isAuthenticatedUser, deleteCoverImage);
userRouter.route("/password/update").patch(isAuthenticatedUser, updatePassword);
userRouter.route("/logout").get(isAuthenticatedUser, logoutUser);

export default userRouter;
