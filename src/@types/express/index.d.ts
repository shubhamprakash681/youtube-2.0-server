import express from "express";
import { IUser } from "models/userModel";

declare global {
  namespace Express {
    interface Request {
      user?: Record<IUser>;
    }
  }
}

export {}; // Ensures the file is treated as a module
