import { IUser } from "../models/userModel";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export {}; // Ensures the file is treated as a module
