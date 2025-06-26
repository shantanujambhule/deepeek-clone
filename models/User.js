
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  image: {
    type: String,
    default: "",
  },
}, {
  timestamps: true,
});

// Prevent model overwrite issue in Next.js
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
