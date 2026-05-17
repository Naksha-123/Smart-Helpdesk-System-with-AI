const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    senderName: { type: String, required: true },
    senderRole: {
      type: String,
      enum: ["user", "agent", "admin", "ai"],
      default: "user",
    },
    content: { type: String, required: true },
    isAI: { type: Boolean, default: false },
    attachments: [{ type: String }],
  },
  { timestamps: true }
);

const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      unique: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: ["Technical", "Billing", "General", "Account", "Feature Request"],
      required: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    messages: [messageSchema],
    aiSuggestion: { type: String, default: "" },
    tags: [{ type: String }],
    resolvedAt: { type: Date },
    closedAt: { type: Date },
    rating: {
  score: { type: Number, min: 1, max: 5, default: null },
  feedback: { type: String, default: '' },
  ratedAt: { type: Date },
},
  },
  { timestamps: true }
);

// Auto-generate ticket ID before saving
ticketSchema.pre("save", async function (next) {
  if (!this.ticketId) {
    const count = await mongoose.model("Ticket").countDocuments();
    this.ticketId = `TKT-${String(count + 1).padStart(4, "0")}`;
  }
  if (this.status === "Resolved" && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
  if (this.status === "Closed" && !this.closedAt) {
    this.closedAt = new Date();
  }
  next();
});

module.exports = mongoose.model("Ticket", ticketSchema);