import { z } from "zod";

const fullnameValidation = z
  .string()
  .min(3, { message: "Fullname must be of atleast 3 characters" });

export const updateProfileValidator = z.object({
  fullname: fullnameValidation,
  email: z.string().email({ message: "Invalid email address" }),
});
