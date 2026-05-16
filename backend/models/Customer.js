import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    dateOfBirth: {
      type: Date
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: "India"
      }
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    },
    contactVerified: {
      type: Boolean,
      default: false
    },
    contactVerifiedAt: {
      type: Date
    },
    contactVerificationOtpHash: {
      type: String,
      select: false
    },
    contactVerificationExpires: {
      type: Date,
      select: false
    },
    documents: [
      {
        label: {
          type: String,
          trim: true,
          default: "Customer document"
        },
        url: {
          type: String,
          required: true
        },
        originalName: String,
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        uploadedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

customerSchema.virtual("fullName").get(function fullName() {
  return `${this.firstName} ${this.lastName}`;
});

customerSchema.set("toJSON", { virtuals: true });
customerSchema.set("toObject", { virtuals: true });

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
