// controllers/assignee.controller.js
const { task, column, board, board_member, user, sequelize } = require("../../models");

// Get all assignees for a task
const getTaskAssignees = async (req, res) => {
  const { taskId } = req.params;

  try {
    // Get task with board info to check permissions
    const foundTask = await task.findOne({
      where: { id: taskId },
      include: [{
        model: column,
        include: { model: board }
      }, {
        model: user,
        as: 'assignees',
        attributes: ['id', 'username', 'email'],
        through: { attributes: [] } // Don't include join table data
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

    res.json({ message: "Success", assignees: foundTask.assignees });
  } catch (err) {
    console.error("Get assignees error:", err);
    res.status(500).json({ message: "Failed to fetch assignees" });
  }
};

// Assign user to task
const assignUserToTask = async (req, res) => {
  const { taskId } = req.params;
  const { userId } = req.body;

  // Validation
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
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

    // Check if user has access and can assign (VIEWER can't)
    const isOwner = foundTask.column.board.user_id === req.user.id;
    const isMember = await board_member.findOne({
      where: { board_id: foundTask.column.board_id, user_id: req.user.id }
    });

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: "Forbidden: You don't have access to this board" });
    }

    if (isMember && isMember.role === 'VIEWER') {
      return res.status(403).json({ message: "Forbidden: Viewers cannot assign tasks" });
    }

    // Check if user to be assigned is a board member
    const userToAssign = await user.findByPk(userId);
    if (!userToAssign) {
      return res.status(404).json({ message: "User not found" });
    }

    const isUserBoardMember = await board_member.findOne({
      where: { board_id: foundTask.column.board_id, user_id: userId }
    });

    const isUserBoardOwner = foundTask.column.board.user_id === userId;

    if (!isUserBoardMember && !isUserBoardOwner) {
      return res.status(400).json({ message: "User is not a member of this board" });
    }

    // Get task object with current assignees
    const taskWithAssignees = await task.findByPk(taskId, {
      include: [{ 
        model: user, 
        as: 'assignees',
        through: { attributes: [] } // Don't query junction table columns
      }]
    });

    // Check if already assigned
    const alreadyAssigned = taskWithAssignees.assignees && taskWithAssignees.assignees.some(a => a.id === userId);
    
    if (alreadyAssigned) {
      return res.status(400).json({ message: "User is already assigned to this task" });
    }

    // Use Sequelize's magic method to add assignee
    await taskWithAssignees.addAssignee(userToAssign);

    // Get user details
    const assignedUser = await user.findOne({
      where: { id: userId },
      attributes: ['id', 'username', 'email']
    });

    res.status(201).json({ message: "User assigned successfully", assignee: assignedUser });
  } catch (err) {
    console.error("Assign user error:", err);
    res.status(500).json({ message: "Failed to assign user" });
  }
};

// Unassign user from task
const unassignUserFromTask = async (req, res) => {
  const { taskId, userId } = req.params;

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

    // Check if user has access and can unassign (VIEWER can't)
    const isOwner = foundTask.column.board.user_id === req.user.id;
    const isMember = await board_member.findOne({
      where: { board_id: foundTask.column.board_id, user_id: req.user.id }
    });

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: "Forbidden: You don't have access to this board" });
    }

    if (isMember && isMember.role === 'VIEWER') {
      return res.status(403).json({ message: "Forbidden: Viewers cannot unassign tasks" });
    }

    // Get the task object
    const taskObj = await task.findByPk(taskId);
    if (!taskObj) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Get the user object
    const userObj = await user.findByPk(userId);
    if (!userObj) {
      return res.status(404).json({ message: "User not found" });
    }

    // Use Sequelize's magic method to remove assignee
    const removed = await taskObj.removeAssignee(userObj);

    if (!removed) {
      return res.status(404).json({ message: "User was not assigned to this task" });
    }

    res.json({ message: "User unassigned successfully" });
  } catch (err) {
    console.error("Unassign user error:", err);
    res.status(500).json({ message: "Failed to unassign user" });
  }
};

module.exports = {
  getTaskAssignees,
  assignUserToTask,
  unassignUserFromTask
};

