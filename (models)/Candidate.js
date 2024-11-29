import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        image: { type: String, required: true },
        party: { type: String, required: true },
        nationalId: { type: String, required: true, unique: true },
        bio: { type: String},
        role: {
            type: String,
            enum: ["candidate"],
            required: true
        },
        electionId:{type: String, required: true},
        electionName:{type: String, required: true},
        
    },
    { timestamps: true }
    );

const Candidate = mongoose.models.Candidate || mongoose.model("Candidate", candidateSchema);

export default Candidate;