import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import ErrorHandler from "./utils/ErrorHandler";
import { StatusCodes } from "http-status-codes";
import { errorMiddleware } from "./middlewares/Error.middleware";

const app = express();

// body-parser
app.use(express.json({ limit: "50kb" }));
// cookie-parsr
app.use(cookieParser());
// cors
app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
  })
);
// url encoded -> for parsing incoming requests with URL-encoded payloads
app.use(express.urlencoded({ extended: true, limit: "50kb" }));

// for serving static files
app.use(express.static("public"));

// routes imports
import {
  healthcheckRouter,
  userRouter,
  videoRouter,
  commentRouter,
  dashboardRouter,
} from "./routes";

// routes use
app.use("/api/v1/", healthcheckRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/video", videoRouter);
app.use("/api/v1/comment", commentRouter);

// handling unknown routes
app.all("*", (req, res, next) => {
  next(
    new ErrorHandler(
      `Route ${req.originalUrl} was not found`,
      StatusCodes.NOT_FOUND
    )
  );
});

// error middleware - For handling all instances of next(new ErrorHandler())
app.use(errorMiddleware);

export default app;
