// controllers/label.controller.js
const { label, task, column, board, board_member, sequelize } = require("../../models");

// Get all labels for a task
const getTaskLabels = async (req, res) => {
  const { taskId } = req.params;

  try {
    // Get task with board info to check permissions
    const foundTask = await task.findOne({
      where: { id: taskId },
      include: [{
        model: column,
        include: { model: board }
      }, {
        model: label,
        through: { attributes: [] } // Don't include junction table data
      }]
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

    res.json({ message: "Success", labels: foundTask.labels || [] });
  } catch (err) {
    console.error("Get labels error:", err);
    res.status(500).json({ message: "Failed to fetch labels", error: err.message });
  }
};

// Add label to task
const addLabelToTask = async (req, res) => {
  const { taskId } = req.params;
  const { name, color } = req.body;

  // Validation
  if (!name || name.trim().length === 0) {
    return res.status(400).json({ message: "Label name is required" });
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

    // Check if user has access and can add labels (VIEWER can't)
    const isOwner = foundTask.column.board.user_id === req.user.id;
    const isMember = await board_member.findOne({
      where: { board_id: foundTask.column.board_id, user_id: req.user.id }
    });

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: "Forbidden: You don't have access to this board" });
    }

    if (isMember && isMember.role === 'VIEWER') {
      return res.status(403).json({ message: "Forbidden: Viewers cannot add labels" });
    }

    // Find or create label
    const [foundLabel, created] = await label.findOrCreate({
      where: { name: name.trim() },
      defaults: {
        name: name.trim(),
        color: color || '#3b82f6'
      }
    });

    // Use Sequelize's association method to check if already associated
    const taskWithLabels = await task.findByPk(taskId, {
      include: [{ 
        model: label,
        through: { attributes: [] } // Don't query junction table columns
      }]
    });

    const alreadyHasLabel = taskWithLabels.labels && taskWithLabels.labels.some(l => l.id === foundLabel.id);
    
    if (alreadyHasLabel) {
      return res.status(400).json({ message: "Label already added to this task" });
    }

    // Use Sequelize's magic method to add label
    await taskWithLabels.addLabel(foundLabel);

    res.status(201).json({ message: "Label added successfully", label: foundLabel });
  } catch (err) {
    console.error("Add label error:", err);
    res.status(500).json({ message: "Failed to add label" });
  }
};

// Remove label from task
const removeLabelFromTask = async (req, res) => {
  const { taskId, labelId } = req.params;

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

    // Check if user has access and can remove labels (VIEWER can't)
    const isOwner = foundTask.column.board.user_id === req.user.id;
    const isMember = await board_member.findOne({
      where: { board_id: foundTask.column.board_id, user_id: req.user.id }
    });

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: "Forbidden: You don't have access to this board" });
    }

    if (isMember && isMember.role === 'VIEWER') {
      return res.status(403).json({ message: "Forbidden: Viewers cannot remove labels" });
    }

    // Get the task object
    const taskObj = await task.findByPk(taskId);
    if (!taskObj) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Get the label object
    const labelObj = await label.findByPk(labelId);
    if (!labelObj) {
      return res.status(404).json({ message: "Label not found" });
    }

    // Use Sequelize's magic method to remove label
    const removed = await taskObj.removeLabel(labelObj);

    if (!removed) {
      return res.status(404).json({ message: "Label was not associated with this task" });
    }

    res.json({ message: "Label removed successfully" });
  } catch (err) {
    console.error("Remove label error:", err);
    res.status(500).json({ message: "Failed to remove label" });
  }
};

module.exports = {
  getTaskLabels,
  addLabelToTask,
  removeLabelFromTask
};

