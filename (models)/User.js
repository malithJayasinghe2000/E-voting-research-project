import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    gsws: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    role: { 
        type: String, 
        enum: ["gsw", "plk", "candidate"],
        required: true 
      },
    password: { type: String, required: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the plk who added this gsw
    
  },
  { timestamps: true }
);

// Avoid redefining the model during hot reloads
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
