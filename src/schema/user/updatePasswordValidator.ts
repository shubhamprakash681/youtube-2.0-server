import { z } from "zod";

export const updatePasswordValidator = z.object({
  oldPassword: z.string().min(6, { message: "Old Password required" }),

  newPassword: z
    .string()
    .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm, {
      message:
        "Password must have at least 8 characters.\nMust contain at least 1 uppercase letter, 1 lowercase letter, and 1 number.\nCan contain special characters",
    }),
});
