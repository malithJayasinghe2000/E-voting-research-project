import mongoose from "mongoose";

const CandidateSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  keywords: { type: [String], default: [] },
});

export default mongoose.models.Candidate || mongoose.model("Candidate", CandidateSchema);
