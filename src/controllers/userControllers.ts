import { NextFunction, Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import { StatusCodes } from "http-status-codes";
import { registerUserSchemaValidator } from "../schema/registerUserSchema";
import ErrorHandler from "../utils/ErrorHandler";
import UserModel from "../models/userModel";

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
        (fields) => fields.trim() === ""
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
    const myFirstAvatarFile = files["avatar"];
    console.log("files: ", files);
    console.log("myFirstAvatarFile: ", myFirstAvatarFile);

    // upload images, avatar to cloudinary
    // check for avatar uploaded successfully

    // create user object - create entry in db

    // remove password and refresh token field
    // check for user creation - return res

    res.status(StatusCodes.CREATED).json({
      success: true,
      files,
    });
  }
);
