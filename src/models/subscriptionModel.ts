import { Document, model, Schema } from "mongoose";

interface ISubscription extends Document {
  subscriber: Schema.Types.ObjectId;
  channel: Schema.Types.ObjectId;
}

const subscriptionSchema = new Schema<ISubscription>(
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

const SubscriptionModel = model<ISubscription>(
  "Subscription",
  subscriptionSchema
);
export default SubscriptionModel;
