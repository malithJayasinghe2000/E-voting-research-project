import mongoose from "mongoose";

const electionSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        image: {
            type: String,
            required: true,
            trim: true,
        },
        startsAt: {
            type: Date,
            required: true,
        },
        endsAt: {
            type: Date,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: false,
        },

    },
    { timestamps: true }
    );

// Avoid redefining the model during hot reloads
const Election = mongoose.models.Election || mongoose.model("Election", electionSchema);

export default Election;