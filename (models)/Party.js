import mongoose from "mongoose";

const PartySchema = new mongoose.Schema(
    {
        short_name: {
            type: String,
            required: true,
            trim: true,
        },
        full_name: {
            type: String,
            required: true,
            trim: true,
        },
        logo: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },

    },
    { timestamps: true }
    );

// Avoid redefining the model during hot reloads
const Party = mongoose.models.Party || mongoose.model("Party", PartySchema);

export default Party;