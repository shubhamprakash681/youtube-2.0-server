import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

// body-parser
app.use(express.json({ limit: "50kb" }));
// cookie-parser
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

export default app;
