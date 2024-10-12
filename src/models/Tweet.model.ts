import { Document, model, Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

interface ITweet extends Document {
  content: string;
  owner: Schema.Types.ObjectId;
}

interface ITweeModel {
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

const TweetModel: ITweeModel = model<ITweet, ITweeModel>("Tweet", TweetSchema);
export default TweetModel;
