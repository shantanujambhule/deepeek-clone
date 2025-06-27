
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({

  name: {type: String, required: [true, "Name is required"]},

  id: {type: String, required: [true],},

  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  image: {
    type: String,
    required: [false],
  },
}, {
  timestamps: true,
});


const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
