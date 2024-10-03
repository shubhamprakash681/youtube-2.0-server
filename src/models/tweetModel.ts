import { Document, model, Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

interface ITweet extends Document {
  content: string;
  owner: Schema.Types.ObjectId;
}
const tweetSchema = new Schema<ITweet>(
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

tweetSchema.plugin(mongooseAggregatePaginate);

const TweetModel = model<ITweet>("Tweet", tweetSchema);
export default TweetModel;
