const Note = require("../models/Note");
const Tenant = require("../models/Tenant");

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private (Member & Admin)
const createNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user?._id;
    const tenantId = userId;

    // Create the note
    const note = await Note.create({
      title,
      content,
      tenantId,
      createdBy: userId,
    });

    // Populate the created note with user info
    await note.populate("createdBy", "email role");

    res.status(201).json({
      success: true,
      message: "Note created successfully",
      data: {
        note: {
          id: note._id,
          title: note.title,
          content: note.content,
          createdBy: note.createdBy,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Create note error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating note",
    });
  }
};

// @desc    Get all notes for the tenant
// @route   GET /api/notes
// @access  Private (Member & Admin)
const getNotes = async (req, res) => {
  try {
    const tenantId = req.user?._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get notes with pagination
    const notes = await Note.findByTenant(tenantId, {
      limit,
      skip,
      sort: { createdAt: -1 },
    });

    // Get total count for pagination info
    const totalNotes = await Note.countByTenant(tenantId);
    const totalPages = Math.ceil(totalNotes / limit);

    res.json({
      success: true,
      data: {
        notes: notes.map((note) => ({
          id: note._id,
          title: note.title,
          content: note.content,
          createdBy: note.createdBy,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
        })),
        pagination: {
          currentPage: page,
          totalPages,
          totalNotes,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get notes error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching notes",
    });
  }
};

// @desc    Get a specific note by ID
// @route   GET /api/notes/:id
// @access  Private (Member & Admin, same tenant only)
const getNote = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user._id;

    const note = await Note.findOne({ _id: id, tenantId }).populate(
      "createdBy",
      "email role"
    );

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    res.json({
      success: true,
      data: {
        note: {
          id: note._id,
          title: note.title,
          content: note.content,
          createdBy: note.createdBy,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Get note error:", error);

    // Handle invalid ObjectId
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while fetching note",
    });
  }
};

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private (Member & Admin, same tenant only)
const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const tenantId = req.user._id;

    const note = await Note.findOne({ _id: id, tenantId });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    // Update fields
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;

    await note.save();
    await note.populate("createdBy", "email role");

    res.json({
      success: true,
      message: "Note updated successfully",
      data: {
        note: {
          id: note._id,
          title: note.title,
          content: note.content,
          createdBy: note.createdBy,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Update note error:", error);

    // Handle invalid ObjectId
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while updating note",
    });
  }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private (Member & Admin, same tenant only)
const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenant._id;

    const note = await Note.findOne({ _id: id, tenantId });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    await Note.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Delete note error:", error);

    // Handle invalid ObjectId
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while deleting note",
    });
  }
};

module.exports = {
  createNote,
  getNotes,
  getNote,
  updateNote,
  deleteNote,
};
