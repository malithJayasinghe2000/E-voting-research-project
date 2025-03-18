import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        no: { type: String, required: true },
        image: { type: String, required: true },
        party: { type: String, required: true },
        nationalId: { type: String, required: true, unique: true },
        bio: { 
            description: { type: String },
            dob: { type: String },
            nationality: { type: String },
            religion: { type: String },
            maritalStatus: { type: String },
            netWorth: { type: String }
        },
        slogan: { type: String },
        profileImage: { type: String },
        socialLinks: {
            linkedin: { type: String },
            github: { type: String },
            twitter: { type: String },
            whatsapp: { type: String }
        },
        education: [{ type: String }],
        experience: [{ type: String }],
        role: {
            type: String,
            enum: ["candidate"],
            required: true
        },
        electionId:{type: String, required: true},
        is_active: { type: Boolean, default: true }, 
    },
    { timestamps: true }
);

const Candidate = mongoose.models.Candidate || mongoose.model("Candidate", candidateSchema);

export default Candidate;