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
    date: {
        type: Date,
    },
    featuredImage: {
        type: String, // cloudinary image url
        required: true,
    }
}, { timestamps: true });

export const Articles = mongoose.model("Articles", articlesSchema);
