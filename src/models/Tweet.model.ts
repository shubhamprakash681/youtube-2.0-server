import { Document, Model, model, Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

interface ITweet extends Document {
  content: string;
  owner: Schema.Types.ObjectId;
}

interface ITweeModel extends Model<ITweet> {
  aggregatePaginate: Function;
}

const TweetSchema: Schema<ITweet> = new Schema(
  {
    content: {
      type: String,
      required: [true, "Content is required to create a Tweet"],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required to create a Tweet"],
    },
  },
  { timestamps: true }
);

TweetSchema.plugin(mongooseAggregatePaginate);

const Tweet: ITweeModel = model<ITweet, ITweeModel>("Tweet", TweetSchema);
export default Tweet;
