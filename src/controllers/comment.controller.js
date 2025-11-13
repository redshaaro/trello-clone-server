// controllers/comment.controller.js
const { comment, task, column, board, board_member, user } = require("../../models");

// Get all comments for a task
const getTaskComments = async (req, res) => {
  const { taskId } = req.params;

  try {
    // Get task with board info to check permissions
    const foundTask = await task.findOne({
      where: { id: taskId },
      include: {
        model: column,
        include: { model: board }
      }
    });

    if (!foundTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if user has access to this board
    const isOwner = foundTask.column.board.user_id === req.user.id;
    const isMember = await board_member.findOne({
      where: { board_id: foundTask.column.board_id, user_id: req.user.id }
    });

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: "Forbidden: You don't have access to this board" });
    }

    // Fetch comments with user details
    const comments = await comment.findAll({
      where: { task_id: taskId },
      include: [{
        model: user,
        attributes: ['id', 'username', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({ message: "Success", comments });
  } catch (err) {
    console.error("Get comments error:", err);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
};

// Add comment to task
const addComment = async (req, res) => {
  const { taskId } = req.params;
  const { text } = req.body;

  // Validation
  if (!text || text.trim().length === 0) {
    return res.status(400).json({ message: "Comment text is required" });
  }

  try {
    // Get task with board info to check permissions
    const foundTask = await task.findOne({
      where: { id: taskId },
      include: {
        model: column,
        include: { model: board }
      }
    });

    if (!foundTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if user has access and can comment (VIEWER can't comment)
    const isOwner = foundTask.column.board.user_id === req.user.id;
    const isMember = await board_member.findOne({
      where: { board_id: foundTask.column.board_id, user_id: req.user.id }
    });

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: "Forbidden: You don't have access to this board" });
    }

    if (isMember && isMember.role === 'VIEWER') {
      return res.status(403).json({ message: "Forbidden: Viewers cannot add comments" });
    }

    // Create comment
    const newComment = await comment.create({
      text: text.trim(),
      task_id: taskId,
      user_id: req.user.id
    });

    // Fetch the comment with user details
    const createdComment = await comment.findOne({
      where: { id: newComment.id },
      include: [{
        model: user,
        attributes: ['id', 'username', 'email']
      }]
    });

    res.status(201).json({ message: "Comment added successfully", comment: createdComment });
  } catch (err) {
    console.error("Add comment error:", err);
    res.status(500).json({ message: "Failed to add comment" });
  }
};

// Delete comment
const deleteComment = async (req, res) => {
  const { taskId, commentId } = req.params;

  try {
    // Find the comment
    const foundComment = await comment.findOne({
      where: { id: commentId, task_id: taskId },
      include: {
        model: task,
        include: {
          model: column,
          include: { model: board }
        }
      }
    });

    if (!foundComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Only comment author or board owner can delete
    const isCommentAuthor = foundComment.user_id === req.user.id;
    const isBoardOwner = foundComment.task.column.board.user_id === req.user.id;

    if (!isCommentAuthor && !isBoardOwner) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own comments" });
    }

    await foundComment.destroy();

    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error("Delete comment error:", err);
    res.status(500).json({ message: "Failed to delete comment" });
  }
};

module.exports = {
  getTaskComments,
  addComment,
  deleteComment
};

