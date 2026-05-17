const express = require("express");
const router = express.Router();
const Ticket = require("../models/Ticket");
const { protect, adminOnly } = require("../middleware/auth");
const { generateAIResponse } = require("../controllers/aiController");
const upload = require('../middleware/upload')

// @POST /api/tickets - Create new ticket
router.post("/", protect, async (req, res) => {
  try {
    const { title, description, category, priority, tags } = req.body;

    const ticket = new Ticket({
      title,
      description,
      category,
      priority: priority || "Medium",
      tags: tags || [],
      createdBy: req.user._id,
      messages: [
        {
          senderName: req.user.name,
          senderRole: req.user.role,
          sender: req.user._id,
          content: description,
        },
      ],
    });

    await ticket.save();

    // Generate AI suggestion automatically
    try {
      const aiReply = await generateAIResponse(
        title,
        description,
        category,
        []
      );
      ticket.aiSuggestion = aiReply;
      ticket.messages.push({
        senderName: "AI Assistant",
        senderRole: "ai",
        isAI: true,
        content: aiReply,
      });
      await ticket.save();
    } catch (aiErr) {
      console.warn("AI suggestion skipped:", aiErr.message);
    }

    await ticket.populate("createdBy", "name email avatar role");

    res.status(201).json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/tickets - Get tickets (user sees own, admin sees all)
router.get("/", protect, async (req, res) => {
  try {
    const { status, priority, category, search, page = 1, limit = 10 } = req.query;

    let query = {};

    // Regular users only see their own tickets
    if (req.user.role === "user") {
      query.createdBy = req.user._id;
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { ticketId: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Ticket.countDocuments(query);
    const tickets = await Ticket.find(query)
      .populate("createdBy", "name email avatar")
      .populate("assignedTo", "name email avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      tickets,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/tickets/stats - Dashboard stats (admin/agent)
router.get("/stats", protect, async (req, res) => {
  try {
    let matchQuery = {};
    if (req.user.role === "user") {
      matchQuery.createdBy = req.user._id;
    }

    const stats = await Ticket.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const priorityStats = await Ticket.aggregate([
      { $match: matchQuery },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);

    const categoryStats = await Ticket.aggregate([
      { $match: matchQuery },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const totalTickets = await Ticket.countDocuments(matchQuery);
    const resolvedToday = await Ticket.countDocuments({
      ...matchQuery,
      status: "Resolved",
      resolvedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    });

    res.json({
      success: true,
      stats: {
        byStatus: stats,
        byPriority: priorityStats,
        byCategory: categoryStats,
        total: totalTickets,
        resolvedToday,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/tickets/:id - Get single ticket
router.get("/:id", protect, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("createdBy", "name email avatar role")
      .populate("assignedTo", "name email avatar role");

    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found." });
    }

    // Users can only view their own tickets
    if (
      req.user.role === "user" &&
      ticket.createdBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    res.json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @PATCH /api/tickets/:id - Update ticket status/priority/assign
router.patch("/:id", protect, async (req, res) => {
  try {
    const { status, priority, assignedTo } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found." });
    }

    // Only admin/agent can change status/priority/assignment
    if (req.user.role !== "admin" && req.user.role !== "agent") {
      return res
        .status(403)
        .json({ success: false, message: "Permission denied." });
    }

    if (status) ticket.status = status;
    if (priority) ticket.priority = priority;
    if (assignedTo !== undefined) ticket.assignedTo = assignedTo || null;

    await ticket.save();
    await ticket.populate("createdBy", "name email avatar");
    await ticket.populate("assignedTo", "name email avatar");

    res.json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/tickets/:id/message - Add a message to ticket
router.post("/:id/message", protect, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Message content is required." });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found." });
    }

    // Users can only message on their own tickets
    if (
      req.user.role === "user" &&
      ticket.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    // Add user message
    ticket.messages.push({
      sender: req.user._id,
      senderName: req.user.name,
      senderRole: req.user.role,
      content,
    });

    // If user sends message, auto-update status to In Progress
    if (ticket.status === "Open" && req.user.role === "user") {
      ticket.status = "In Progress";
    }

    await ticket.save();

    // If user sent the message, optionally generate AI follow-up
    if (req.user.role === "user") {
      try {
        const conversationHistory = ticket.messages.map((m) => m.content);
        const aiReply = await generateAIResponse(
          ticket.title,
          content,
          ticket.category,
          conversationHistory
        );
        ticket.messages.push({
          senderName: "AI Assistant",
          senderRole: "ai",
          isAI: true,
          content: aiReply,
        });
        await ticket.save();
      } catch (aiErr) {
        console.warn("AI follow-up skipped:", aiErr.message);
      }
    }

    await ticket.populate("createdBy", "name email avatar role");
    // Emit real-time event to all users in this ticket room
const io = req.app.get('io')
if (io) {
  io.to(req.params.id).emit('new_message', {
    ticketId: req.params.id,
    ticket,
  })
}
    res.json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @DELETE /api/tickets/:id - Delete ticket (admin only)
router.delete("/:id", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Admin only action." });
    }
    await Ticket.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Ticket deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// @POST /api/tickets/:id/rate - Rate a resolved ticket
router.post('/:id/rate', protect, async (req, res) => {
  try {
    const { score, feedback } = req.body

    if (!score || score < 1 || score > 5) {
      return res.status(400).json({ success: false, message: 'Score must be between 1 and 5.' })
    }

    const ticket = await Ticket.findById(req.params.id)
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' })
    }

    // Only the ticket creator can rate
    if (ticket.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the ticket creator can rate.' })
    }

    // Only resolved or closed tickets can be rated
    if (ticket.status !== 'Resolved' && ticket.status !== 'Closed') {
      return res.status(400).json({ success: false, message: 'Only resolved tickets can be rated.' })
    }

    // Can only rate once
    if (ticket.rating.score) {
      return res.status(400).json({ success: false, message: 'You have already rated this ticket.' })
    }

    ticket.rating = { score, feedback: feedback || '', ratedAt: new Date() }
    await ticket.save()

    res.json({ success: true, message: 'Thank you for your feedback!', ticket })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// @POST /api/tickets/:id/upload - Upload image attachment
router.post('/:id/upload', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' })
    }

    const ticket = await Ticket.findById(req.params.id)
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' })
    }

    // Build file URL
    const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`

    // Add as a message with attachment
    ticket.messages.push({
      sender: req.user._id,
      senderName: req.user.name,
      senderRole: req.user.role,
      content: '📎 Attached an image',
      attachments: [fileUrl],
    })

    await ticket.save()
    await ticket.populate('createdBy', 'name email avatar role')

    // Emit socket event
    const io = req.app.get('io')
    if (io) {
      io.to(req.params.id).emit('new_message', {
        ticketId: req.params.id,
        ticket,
      })
    }

    res.json({ success: true, fileUrl, ticket })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

module.exports = router;