import { CookieOptions, NextFunction, Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import { StatusCodes } from "http-status-codes";
import {
  loginSchemaValidator,
  registerUserSchemaValidator,
  updatePasswordSchemaValidator,
  updateProfileValidator,
} from "../schema/user";
import ErrorHandler from "../utils/ErrorHandler";
import UserModel, { IUser } from "../models/userModel";
import { deleteCloudinaryFile, uploadOnCloudinary } from "../utils/cloudinary";
import APIResponse from "../utils/APIResponse";
import jwt from "jsonwebtoken";

interface IRegisterUserBody {
  username: string;
  email: string;
  fullname: string;
  password: string;
}

interface ILoginUserBody {
  identifier: string;
  password: string;
}

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
};

const generateAccessAndRefreshTokenToken = async (
  user: IUser
): Promise<{ accessToken: string; refreshToken: string }> => {
  try {
    const refreshToken = user.generateRefreshToken();
    const accessToken = user.generateAccessToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (err: any) {
    throw new ErrorHandler(
      "Failed to generate Login Session! Please try after sometime.",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

export const registerUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // get user details from frontend
    const { username, email, fullname, password } =
      req.body as IRegisterUserBody;

    // validations
    if (
      [username, email, fullname, password].some(
        (fields) => fields?.trim() === ""
      )
    ) {
      return next(
        new ErrorHandler("All fields are required!", StatusCodes.BAD_REQUEST)
      );
    }
    const validationRes = registerUserSchemaValidator.safeParse({
      username,
      email,
      fullname,
      password,
    });
    // console.log("validationRes: ", validationRes);
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

    // check if user already exists
    const userAlreadyExists = await UserModel.findOne({
      $or: [{ username }, { email }],
    });
    if (userAlreadyExists) {
      return next(
        new ErrorHandler(
          "User with same username or email already exists",
          StatusCodes.CONFLICT
        )
      );
    }

    // check for images, check for avatar
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const avatar = files["avatar"]?.at(0);
    const coverImage = files["coverImage"]?.at(0);
    let coverImageRes = null;

    if (!avatar) {
      return next(
        new ErrorHandler("Avatar is required!", StatusCodes.BAD_REQUEST)
      );
    }

    // upload images- avatar, coverImage to cloudinary
    const avatarCloudRes = await uploadOnCloudinary(
      avatar.path,
      `user/${username}/avatar`
    );
    if (coverImage) {
      const coverImageCloudRes = await uploadOnCloudinary(
        coverImage.path,
        `user/${username}/coverImage`
      );

      if (coverImageCloudRes) {
        coverImageRes = coverImageCloudRes;
      }
    }

    // check for avatar uploaded successfully
    if (!avatarCloudRes) {
      return next(
        new ErrorHandler(
          "User Registration Failed! Please try after some time.",
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    }

    // create user object - create entry in db
    const user = await UserModel.create({
      username,
      email,
      fullname,
      password,
      avatar: { public_id: avatarCloudRes.public_id, url: avatarCloudRes.url },
      coverImage: coverImageRes
        ? { public_id: coverImageRes.public_id, url: coverImageRes.url }
        : { public_id: "", url: "" },
    });

    // full proof method -- ensuring by making an extra DB call
    // remove password and refresh token field
    const userData = await UserModel.findById(user._id).select(
      "-password -refreshToken"
    );

    // check for user creation - return res
    if (!userData) {
      return next(
        new ErrorHandler(
          "User Registration Failed! Please try after some time.",
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    }

    return res.status(StatusCodes.CREATED).json(
      new APIResponse(StatusCodes.CREATED, "User Registered Successfully!", {
        user: userData,
      })
    );
  }
);

export const loginUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { identifier, password } = req.body as ILoginUserBody;

    // schema validation
    const validationResponse = loginSchemaValidator.safeParse({
      identifier,
      password,
    });

    if (!validationResponse.success) {
      const validationErrors = validationResponse.error.errors.map(
        (err) => err.message
      );

      return next(
        new ErrorHandler(
          validationErrors.length
            ? validationErrors.join(", ")
            : "Invalid query parameters",
          StatusCodes.BAD_REQUEST
        )
      );
    }

    const user = await UserModel.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    }).select("+password");

    if (!user) {
      return next(
        new ErrorHandler("Account not exists!", StatusCodes.NOT_FOUND)
      );
    }

    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
      return next(
        new ErrorHandler(
          "Login Identifier or Password is incorrect",
          StatusCodes.UNAUTHORIZED
        )
      );
    }

    const { accessToken, refreshToken } =
      await generateAccessAndRefreshTokenToken(user);

    // removing password & refreshToken fields
    user.password = "";
    user.refreshToken = "";

    res
      .status(StatusCodes.OK)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(
        new APIResponse(StatusCodes.OK, `Welcome back ${user.fullname}!`, {
          user,
          accessToken,
          refreshToken,
        })
      );
  }
);

export const getUserProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.status(StatusCodes.OK).json(
      new APIResponse(StatusCodes.OK, "Profile data sent successfully", {
        user: req.user,
      })
    );
  }
);
export const updateProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { fullname, email } = req.body as { fullname: string; email: string };

    if (!email || !fullname) {
      return next(
        new ErrorHandler("All fields are required!", StatusCodes.BAD_REQUEST)
      );
    }

    const validationRes = updateProfileValidator.safeParse({
      email,
      fullname,
    });

    if (!validationRes.success) {
      const validationErrors = validationRes.error.errors.map(
        (err) => err.message
      );
      return next(
        new ErrorHandler(
          validationErrors.length
            ? validationErrors.join(", ")
            : "Invalid parameters",
          StatusCodes.BAD_REQUEST
        )
      );
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user._id,
      { $set: { email, fullname } },
      { new: true }
    ).select("-password -refreshToken");

    res.status(StatusCodes.OK).json(
      new APIResponse(StatusCodes.OK, "Profile updated successfully!", {
        user: updatedUser,
      })
    );
  }
);
export const updateUserAvatar = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
      return next(
        new ErrorHandler("New Avatar file is required", StatusCodes.BAD_REQUEST)
      );
    }

    const avatarCloudResponse = await uploadOnCloudinary(
      avatarLocalPath,
      `user/${req.user?.username}/avatar`
    );
    if (!avatarCloudResponse) {
      return next(
        new ErrorHandler(
          "User Avatar update failed! Please try after some time.",
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    }

    // delete old cloudinary image
    await deleteCloudinaryFile(req.user?.avatar.public_id);

    const modifiedUser = await UserModel.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          avatar: {
            public_id: avatarCloudResponse.public_id,
            url: avatarCloudResponse.url,
          },
        },
      },
      { new: true }
    ).select("-password -refreshToken");

    res.status(StatusCodes.OK).json(
      new APIResponse(StatusCodes.OK, "User Avatar updated successfully!", {
        user: modifiedUser,
      })
    );
  }
);
export const updateUserCoverImage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const covImageLocalPath = req.file?.path;

    if (!covImageLocalPath) {
      return next(
        new ErrorHandler(
          "New Cover Image file is required",
          StatusCodes.BAD_REQUEST
        )
      );
    }

    const covImageCloudRes = await uploadOnCloudinary(
      covImageLocalPath,
      `user/${req.user?.username}/coverImage`
    );
    if (!covImageCloudRes) {
      return next(
        new ErrorHandler(
          "Cover Image update Failed! Please try again after some time",
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    }

    // delete old cloudinary image
    await deleteCloudinaryFile(req.user?.coverImage.public_id);

    const modifiedUser = await UserModel.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          coverImage: {
            public_id: covImageCloudRes.public_id,
            url: covImageCloudRes.url,
          },
        },
      },
      { new: true }
    ).select("-password -refreshToken");

    res.status(StatusCodes.OK).json(
      new APIResponse(StatusCodes.OK, "Cover Image updated successfully!", {
        user: modifiedUser,
      })
    );
  }
);
export const deleteCoverImage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    await deleteCloudinaryFile(req.user?.coverImage.public_id);

    const modifiedUser = await UserModel.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          coverImage: {
            public_id: "",
            url: "",
          },
        },
      },
      { new: true }
    ).select("-password -refreshToken");

    res.status(StatusCodes.OK).json(
      new APIResponse(StatusCodes.OK, "Cover Image deleted successfully!", {
        user: modifiedUser,
      })
    );
  }
);

export const updatePassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { oldPassword, newPassword } = req.body;

    // validations
    const validationRes = updatePasswordSchemaValidator.safeParse({
      oldPassword,
      newPassword,
    });

    if (!validationRes.success) {
      const validationErrors = validationRes.error.errors.map(
        (err) => err.message
      );

      return next(
        new ErrorHandler(
          validationErrors.length
            ? validationErrors.join(", ")
            : "Invalid update password parameters",
          StatusCodes.BAD_REQUEST
        )
      );
    }

    // getting user data from db
    const user = await UserModel.findById(req.user?._id).select("+password");

    if (user) {
      const isPasswordMatched = await user?.comparePassword(oldPassword);
      if (!isPasswordMatched) {
        return next(
          new ErrorHandler("Old password is incorrect", StatusCodes.BAD_REQUEST)
        );
      }

      user.password = newPassword;

      await user.save({ validateBeforeSave: false });

      return res
        .status(StatusCodes.OK)
        .json(new APIResponse(StatusCodes.OK, "Password updated successfully"));
    }

    return next(
      new ErrorHandler(
        "Something went wrong while updating Password",
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }
);

export const refreshSession = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      return next(
        new ErrorHandler("Unauthorized request", StatusCodes.UNAUTHORIZED)
      );
    }

    const decodedUser = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as unknown as { _id: string };

    const user = await UserModel.findById(decodedUser._id);

    if (!user) {
      return next(
        new ErrorHandler(
          "Refresh token is expired or used",
          StatusCodes.UNAUTHORIZED
        )
      );
    }

    // verifying refresh token again from DB for extra security
    if (incomingRefreshToken !== user.refreshToken) {
      return next(
        new ErrorHandler(
          "Refresh token is expired or used",
          StatusCodes.UNAUTHORIZED
        )
      );
    }

    const { accessToken, refreshToken } =
      await generateAccessAndRefreshTokenToken(user);

    // removing password & refreshToken fields
    user.password = "";
    user.refreshToken = "";

    res
      .status(StatusCodes.OK)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(
        new APIResponse(StatusCodes.OK, `Welcome back ${user.fullname}!`, {
          user,
          accessToken,
          refreshToken,
        })
      );
  }
);

export const logoutUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    await UserModel.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          refreshToken: "",
        },
      },
      {
        new: true,
      }
    );

    res
      .status(StatusCodes.OK)
      .clearCookie("accessToken", cookieOptions)
      .clearCookie("refreshToken", cookieOptions)
      .json(new APIResponse(StatusCodes.OK, "Logged out successfully"));
  }
);
