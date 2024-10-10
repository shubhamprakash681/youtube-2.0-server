import { z } from "zod";

export const loginUserValidator = z.object({
  identifier: z.string().min(1, { message: "Identifier is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});
