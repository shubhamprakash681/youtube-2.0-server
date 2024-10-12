import { Document, Model, model, Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

interface IPlaylist extends Document {
  name: string;
  description?: string;
  videos: Schema.Types.ObjectId[];
  owner: Schema.Types.ObjectId;
}

interface IPlaylistModel extends Model<IPlaylist> {
  aggregatePaginate: Function;
}

const PlaylistSchema: Schema<IPlaylist> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Playlist Name is required"],
    },
    description: {
      type: String,
    },
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
        default: [],
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Playlist Owner is required"],
    },
  },
  { timestamps: true }
);

PlaylistSchema.plugin(mongooseAggregatePaginate);

const PlaylistModel: IPlaylistModel = model<IPlaylist, IPlaylistModel>(
  "Playlist",
  PlaylistSchema
);
export default PlaylistModel;
