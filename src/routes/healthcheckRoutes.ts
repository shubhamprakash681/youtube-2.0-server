import express, { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const healthcheckRouter = express.Router();

healthcheckRouter
  .route("/")
  .get((req: Request, res: Response, next: NextFunction) => {
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Server running",
      node_env: process.env.NODE_ENV,
      port: process.env.PORT,
    });
  });

export default healthcheckRouter;
