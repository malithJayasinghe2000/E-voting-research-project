import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    gsws: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    role: { 
        type: String, 
        enum: ["gsw", "plk", "candidate", "polling_manager"],
        required: true 
      },
    password: { type: String, required: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the plk who added this gsw
    constituency_identification_number: { type: String},
    phone: { type: String},
    status: { type: String, enum: ["active", "inactive"], default: "active" },

    nationaId: { type: String },
    district: { type: String },
    local_council: { type: String },

  },
  { timestamps: true }
);

// Avoid redefining the model during hot reloads
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
