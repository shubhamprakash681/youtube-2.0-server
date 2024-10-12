import express from "express";
import { IUser } from "../../models/User.model";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export {}; // Ensures the file is treated as a module
