import mongoose from "mongoose";

const VoteSchema = new mongoose.Schema({
  candidateId: { type: String, required: true },
  priority1: { type: Number, required: true },
  priority2: { type: Number, required: true },
  priority3: { type: Number, required: true },
});

const PollingManagerSchema = new mongoose.Schema({
  pollingManagerId: { type: String, required: true },
  votes: [VoteSchema],
});

const PublishedVotesSchema = new mongoose.Schema(
  {
    plkUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    district: { type: String, required: true },
    local_council: { type: String, required: true },
    pollingManagers: [PollingManagerSchema],
    timestamp: { type: Date, default: Date.now },
  },
  { collection: "vote_results" }
);

export default mongoose.models.PublishedVotes || mongoose.model("PublishedVotes", PublishedVotesSchema);
