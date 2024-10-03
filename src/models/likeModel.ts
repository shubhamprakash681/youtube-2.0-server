import { Document, model, Schema } from "mongoose";

interface ILike extends Document {
  video?: Schema.Types.ObjectId;
  comment?: Schema.Types.ObjectId;
  tweet?: Schema.Types.ObjectId;
  likedBy: Schema.Types.ObjectId;
}
const likeSchema = new Schema<ILike>(
  {
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    tweet: {
      type: Schema.Types.ObjectId,
      ref: "Tweet",
    },
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "LikedBy is required to create a Like"],
    },
  },
  {
    timestamps: true,
  }
);

const LikeModel = model<ILike>("Like", likeSchema);
export default LikeModel;
