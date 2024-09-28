import { NextFunction, Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import { StatusCodes } from "http-status-codes";
import { registerUserSchemaValidator } from "../schema/user";
import ErrorHandler from "../utils/ErrorHandler";
import UserModel from "../models/userModel";
import { uploadOnCloudinary } from "../utils/cloudinary";
import APIResponse from "../utils/APIResponse";

interface IRegisterUserBody {
  username: string;
  email: string;
  fullname: string;
  password: string;
}

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
      avatar: avatarCloudRes.url,
      coverImage: coverImageRes ? coverImageRes.url : "",
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
    const { email, password } = req.body;
  }
);
