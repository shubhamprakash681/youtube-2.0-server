import { model, Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

interface IComment extends Document {
  content: string;
  video: Schema.Types.ObjectId;
  owner: Schema.Types.ObjectId;
}

interface ICommentModel {
  aggregatePaginate: Function;
}

const CommentSchema: Schema<IComment> = new Schema(
  {
    content: {
      type: String,
      required: [true, "Content is required to add Comment"],
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: [true, "Video reference is required to create a Comment"],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner reference is required to create a Comment"],
    },
  },
  {
    timestamps: true,
  }
);

CommentSchema.plugin(mongooseAggregatePaginate);

const CommentModel: ICommentModel = model<IComment, ICommentModel>(
  "Comment",
  CommentSchema
);
export default CommentModel;
