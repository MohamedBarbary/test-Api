// models/userModel.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name required"],
      validate: {
        validator: function (v) {
          return v.trim().split(" ").length >= 2;
        },
        message: "Full name must be at least 2 words",
      },
    },
    phone: {
      type: String,
      required: [true, "Phone required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password required"],
      minlength: 6,
      select: false, // hide password by default
    },
    admin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

module.exports = mongoose.model("User", userSchema);
