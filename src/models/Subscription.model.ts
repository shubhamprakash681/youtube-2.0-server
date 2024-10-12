import { Document, model, Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

interface ISubscription extends Document {
  subscriber: Schema.Types.ObjectId;
  channel: Schema.Types.ObjectId;
}

interface ISubscriptionModel {
  aggregatePaginate: Function;
}

const SubscriptionSchema: Schema<ISubscription> = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Subscriber is required to create a Subscription"],
    },
    channel: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Channel is required to create a Subscription"],
    },
  },
  { timestamps: true }
);

SubscriptionSchema.plugin(mongooseAggregatePaginate);

const SubscriptionModel: ISubscriptionModel = model<
  ISubscription,
  ISubscriptionModel
>("Subscription", SubscriptionSchema);
export default SubscriptionModel;
