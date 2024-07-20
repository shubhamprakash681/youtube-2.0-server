import { NextFunction, Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import { StatusCodes } from "http-status-codes";
import { registerUserSchemaValidator } from "../schema/registerUserSchema";
import ErrorHandler from "../utils/ErrorHandler";

interface IRegisterUserBody {
  username: string;
  email: string;
  fullname: string;
  password: string;
  // avatar?: {
  //   public_id: string;
  //   url: string;
  // };
}

export const registerUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // get user details from frontend
    const { username, email, fullname, password } =
      req.body as IRegisterUserBody;

    // validations
    const validationRes = registerUserSchemaValidator.safeParse({
      username,
      email,
      fullname,
      password,
    });
    console.log("validationRes: ", validationRes);
    if (!validationRes.success) {
      const validationErrors = validationRes.error.errors.map((err) => err);

      console.log("validationErrors: ", validationErrors);

      // const errrHndlr = new ErrorHandler(
      //   validationErrors.length
      //     ? validationErrors.join(", ")
      //     : "Invalid query parameter",
      //   StatusCodes.BAD_REQUEST
      // );

      // console.log("errrHndlr: ", errrHndlr);

      return next(validationErrors);
    }

    // check if user already exists
    // check for images, check for avatar
    // upload images, avatar to cloudinary
    // check for avatar uploaded successfully

    // create user object - create entry in db

    // remove password and refresh token field
    // check for user creation - return res

    res.status(StatusCodes.CREATED).json({
      success: true,
    });
  }
);
