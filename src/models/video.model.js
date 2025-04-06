import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const VideoData = {
    videoFile: {
        type: String, //cloudinary url
        required: true,
    },
    thumbnail: {
        type: String, //cloudinary url
        required: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    title: {
        type: String,
        required: true,
        trim: true,
        minLength: 3,
        maxLength: 90,
    },
    description: {
        type: String,
        required: true,
        trim: true,
        minLength: 10,
        maxLength: 500,
    },
    duration: {
        type: Number,
        required: true,
    },
    view: {
        type: Number,
        default: 0,
    },
    isPublic: {
        type: Boolean,
        default: true,
    },

}

const videoSchema = new mongoose.Schema(VideoData, { timeseries: true });
videoSchema.plugin(mongooseAggregatePaginate);
const Video = mongoose.model("Video", videoSchema);

export default Video;