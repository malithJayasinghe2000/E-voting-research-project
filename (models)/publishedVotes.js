import mongoose from "mongoose";

const VoteSchema = new mongoose.Schema({
    candidateId: { type: String, required: true },
    priority1: { type: Number, required: true },
    priority2: { type: Number, required: true },
    priority3: { type: Number, required: true },
  });
  
  const PublishedVotesSchema = new mongoose.Schema(
    {
      pollingManagerId: { type: String, required: true },
      votes: [VoteSchema],
      timestamp: { type: Date, default: Date.now },
    },
    { collection: "vote_results" }
  );
  
export default mongoose.models.publishedVotes || mongoose.model("publishedVotes", PublishedVotesSchema);
