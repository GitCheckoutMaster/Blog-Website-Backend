import mongoose from 'mongoose';
// content, title, userid, date, featuredImage

const articlesSchema = new mongoose.Schema({
    content: {
        type: String, 
        required: true,
    },
    title: {
        type: String, 
        required: true,
    },
    userid: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    status: {
        type: String,
        required: true,
        default: 'inactive',
    },
    featuredImage: {
        type: String, // cloudinary image url
        required: true,
    }
}, { timestamps: true });

export const Articles = mongoose.model("Articles", articlesSchema);
