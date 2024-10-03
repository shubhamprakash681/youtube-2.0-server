import { Document, model, Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

interface IPlaylist extends Document {
  name: string;
  description?: string;
  videos: Schema.Types.ObjectId[];
  owner: Schema.Types.ObjectId;
}
const playlistSchema = new Schema<IPlaylist>(
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

playlistSchema.plugin(mongooseAggregatePaginate);

const PlaylistModel = model<IPlaylist>("Playlist", playlistSchema);
export default PlaylistModel;
