require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const http = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./routes/auth");
const ticketRoutes = require("./routes/tickets");
const aiRoutes = require("./routes/ai");

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Make io accessible in routes
app.set("io", io);

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(morgan("dev"));
app.use('/uploads', express.static('uploads'));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/ai", aiRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Smart Helpdesk API is running" });
});

// Socket.io events
io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  // Join a ticket room
  socket.on("join_ticket", (ticketId) => {
    socket.join(ticketId);
    console.log(`User joined ticket room: ${ticketId}`);
  });

  // Leave a ticket room
  socket.on("leave_ticket", (ticketId) => {
    socket.leave(ticketId);
    console.log(`User left ticket room: ${ticketId}`);
  });

  // Typing indicator
  socket.on("typing", ({ ticketId, userName, isTyping }) => {
    socket.to(ticketId).emit("user_typing", { userName, isTyping });
  });

  socket.on("disconnect", () => {
    console.log("🔌 User disconnected:", socket.id);
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });