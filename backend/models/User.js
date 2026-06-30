const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firstName: 
    { type: String, 
      required: true,
       trim: true

     },

    lastName:
     { 
      type: String,
       required: true, 
       trim: true
       },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { 
      type: String,
       required: true, 
       minlength: 6 
      },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    dateOfBirth: { type: Date },
    phoneNumber: { type: String, trim: true },
    // قائمة المفضّلة (Wishlist) — منتجات حفظها المستخدم
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Convenience full-name field (not stored, computed from first + last name)
userSchema.virtual("name").get(function () {
  return `${this.firstName} ${this.lastName}`.trim();
});

// Hash the password before saving (only if it changed)
// ملاحظة: في Mongoose الحديث الـ async hook مابياخدش next — بنستخدم await وبس.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare a plain password with the hashed one
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
