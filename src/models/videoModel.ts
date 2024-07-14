import { Document, Model, model, Schema } from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

interface IVideo extends Document {
  videoFile: string;
  thumbnail: string;
  title: string;
  description: string;
  duration: number;
  views: number;
  isPublic: boolean;
  owner: Schema.Types.ObjectId;
}

const videoSchema: Schema<IVideo> = new Schema(
  {
    videoFile: {
      type: String,
      required: true,
    },

    thumbnail: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },

    duration: {
      type: Number,
      required: true,
    },

    views: {
      type: Number,
      default: 0,
    },

    isPublic: {
      type: Boolean,
      default: true,
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

videoSchema.plugin(aggregatePaginate);

const VideoModel: Model<IVideo> = model("Video", videoSchema);

export default VideoModel;
