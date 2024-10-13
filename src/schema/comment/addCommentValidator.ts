import { z } from "zod";

export const addCommentValidator = z.object({
  content: z
    .string()
    .min(3, { message: "Comment must be of atleast 3 characters" }),
});
