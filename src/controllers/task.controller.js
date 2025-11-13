const { task, column, board, board_member } = require("../../models");
const { Op } = require("sequelize");
const { sequelize } = require("../../models");


// ✅ GET all tasks for a specific column (and verify it's the user's board)
const getAllTasks = async (req, res) => {
  const { id } = req.params; // This is column_id

  try {
    // Find the column and its board
    const foundColumn = await column.findOne({
      where: { id },
      include: { 
        model: board,
        required: true
      }
    });

    if (!foundColumn) {
      return res.status(404).json({ message: "Column not found" });
    }

    if (!foundColumn.board) {
      return res.status(500).json({ message: "Board association not loaded properly" });
    }

    const boardId = Number(foundColumn.board_id);
    const boardOwnerId = Number(foundColumn.board.user_id);
    const currentUserId = Number(req.user.id);

    // Check if user is owner or member
    const isOwner = boardOwnerId === currentUserId;
    const isMember = await board_member.findOne({
      where: { board_id: boardId, user_id: req.user.id }
    });

    if (!isOwner && !isMember) {
      return res.status(403).json({ 
        message: "Forbidden: You don't have access to this board",
        debug: {
          currentUserId: currentUserId,
          boardOwnerId: boardOwnerId,
          boardId: boardId,
          isOwner: isOwner,
          hasMemberRecord: !!isMember,
          memberRole: isMember ? isMember.role : null
        }
      });
    }

    // Fetch tasks in the column
    const tasks = await task.findAll({ 
      where: { column_id: id },
      order: [['position', 'ASC']]
    });
    
    res.status(200).json({ message: "success", tasks });

  } catch (err) {
    console.error("Get tasks error:", err);
    res.status(500).json({ message: "Couldn't fetch tasks", error: err.message });
  }
};

// ✅ CREATE task in a column that belongs to the user
const createtask = async (req, res) => {
  const { title, description, status, column_id } = req.body;

  // Input validation
  if (!title || title.trim().length === 0) {
    return res.status(400).json({ message: "Task title is required" });
  }

  if (title.length > 255) {
    return res.status(400).json({ message: "Task title must be less than 255 characters" });
  }

  if (!column_id) {
    return res.status(400).json({ message: "Column ID is required" });
  }

  // Validate status if provided
  if (status && !['todo', 'in-progress', 'done'].includes(status)) {
    return res.status(400).json({ message: "Invalid status. Must be 'todo', 'in-progress', or 'done'" });
  }

  try {
    const foundColumn = await column.findOne({
      where: { id: column_id },
      include: { model: board }
    });

    if (!foundColumn) {
      return res.status(404).json({ message: "Column not found" });
    }

    // Check if user is owner or member
    const isOwner = foundColumn.board.user_id === req.user.id;
    const isMember = await board_member.findOne({
      where: { board_id: foundColumn.board_id, user_id: req.user.id }
    });

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: "Forbidden: You don't have access to this board" });
    }

    // Check role permissions - VIEWER can't create tasks
    if (isMember && isMember.role === 'VIEWER') {
      return res.status(403).json({ message: "Forbidden: Viewers cannot create tasks" });
    }

    const lastTask = await task.findOne({
      where: { column_id },
      order: [['position', 'DESC']]
    });

    const newPosition = lastTask ? lastTask.position + 1 : 0;

    const createdtask = await task.create({
      title: title.trim(),
      description: description || '',
      status: status || 'todo',
      column_id,
      position: newPosition
    });

    res.status(201).json({ message: "success", createdtask });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Couldn't create task" });
  }
};

// ✅ GET task by ID if it belongs to the user
const gettaskById = async (req, res) => {
  const { id } = req.params;

  try {
    const foundTask = await task.findOne({
      where: { id },
      include: {
        model: column,
        include: { model: board }
      }
    });

    if (!foundTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if user is owner or member
    const isOwner = foundTask.column.board.user_id === req.user.id;
    const isMember = await board_member.findOne({
      where: { board_id: foundTask.column.board_id, user_id: req.user.id }
    });

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: "Forbidden: You don't have access to this board" });
    }

    res.status(200).json({ message: "success", task: foundTask });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Couldn't fetch task" });
  }
};

// ✅ UPDATE task title if it's in a board of the current user
const edittask = async (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;

  // Input validation
  if (title !== undefined && title.trim().length === 0) {
    return res.status(400).json({ message: "Task title cannot be empty" });
  }

  if (title && title.length > 255) {
    return res.status(400).json({ message: "Task title must be less than 255 characters" });
  }

  // Validate status if provided
  if (status && !['todo', 'in-progress', 'done'].includes(status)) {
    return res.status(400).json({ message: "Invalid status. Must be 'todo', 'in-progress', or 'done'" });
  }

  try {
    const foundTask = await task.findOne({
      where: { id },
      include: {
        model: column,
        include: { model: board }
      }
    });

    if (!foundTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if user is owner or member
    const isOwner = foundTask.column.board.user_id === req.user.id;
    const isMember = await board_member.findOne({
      where: { board_id: foundTask.column.board_id, user_id: req.user.id }
    });

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: "Forbidden: You don't have access to this board" });
    }

    // Check role permissions - VIEWER can't edit tasks
    if (isMember && isMember.role === 'VIEWER') {
      return res.status(403).json({ message: "Forbidden: Viewers cannot edit tasks" });
    }

    // update only allowed fields (only update fields that are provided)
    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;

    await task.update(updateData, { where: { id } });

    const updatedTask = await task.findByPk(id);

    res.status(200).json({ message: "success", editedtask: updatedTask });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Couldn't update task" });
  }
};

// ✅ DELETE task if it belongs to the current user
const deletetask = async (req, res) => {
  const { id } = req.params;

  try {
    const foundTask = await task.findOne({
      where: { id },
      include: {
        model: column,
        include: { model: board }
      }
    });

    if (!foundTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if user is owner or member
    const isOwner = foundTask.column.board.user_id === req.user.id;
    const isMember = await board_member.findOne({
      where: { board_id: foundTask.column.board_id, user_id: req.user.id }
    });

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: "Forbidden: You don't have access to this board" });
    }

    // Check role permissions - VIEWER can't delete, MEMBER can delete
    if (isMember && isMember.role === 'VIEWER') {
      return res.status(403).json({ message: "Forbidden: Viewers cannot delete tasks" });
    }

    await task.destroy({ where: { id } });

    res.status(200).json({ message: "success", deletedtask: id });

  } catch (err) {
    console.error("Delete task error:", err);
    res.status(500).json({ message: "Couldn't delete task" });
  }
};
// ✅ Move task to new column or reorder within same column
const moveTask = async (req, res) => {
  try {
    const { taskId, sourceColumnId, targetColumnId, targetPosition } = req.body;

    if (!taskId || !sourceColumnId || !targetColumnId || targetPosition === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const taskfound = await task.findOne({
      where: { id: taskId },
      include: {
        model: column,
        include: { model: board }
      }
    });

    if (!taskfound) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Check if user has access and can move tasks
    const isOwner = taskfound.column.board.user_id === req.user.id;
    const isMember = await board_member.findOne({
      where: { board_id: taskfound.column.board_id, user_id: req.user.id }
    });

    if (!isOwner && !isMember) {
      return res.status(403).json({ error: "Forbidden: You don't have access to this board" });
    }

    // Check role permissions - VIEWER can't move tasks
    if (isMember && isMember.role === 'VIEWER') {
      return res.status(403).json({ error: "Forbidden: Viewers cannot move tasks" });
    }

    const sourcePosition = taskfound.position;

    if (typeof sourcePosition !== 'number' || typeof targetPosition !== 'number') {
      return res.status(400).json({ error: "Invalid task position values" });
    }

    // Step 1: Shift down tasks in source column (only if moving to different column)
    if (sourceColumnId !== targetColumnId) {
      await task.update(
        { position: sequelize.literal('"position" - 1') },
        {
          where: {
            column_id: sourceColumnId,
            position: { [Op.gt]: sourcePosition },
          },
        }
      );

      // Step 2: Shift up tasks in target column
      await task.update(
        { position: sequelize.literal('"position" + 1') },
        {
          where: {
            column_id: targetColumnId,
            position: { [Op.gte]: targetPosition },
          },
        }
      );
    } else {
      // Moving inside the same column
      if (targetPosition > sourcePosition) {
        // Move down: shift tasks between old+1 and targetPosition down
        await task.update(
          { position: sequelize.literal('"position" - 1') },
          {
            where: {
              column_id: sourceColumnId,
              position: {
                [Op.gt]: sourcePosition,
                [Op.lte]: targetPosition,
              },
            },
          }
        );
      } else if (targetPosition < sourcePosition) {
        // Move up: shift tasks between targetPosition and old-1 up
        await task.update(
          { position: sequelize.literal('"position" + 1') },
          {
            where: {
              column_id: sourceColumnId,
              position: {
                [Op.gte]: targetPosition,
                [Op.lt]: sourcePosition,
              },
            },
          }
        );
      }
    }

    // Step 3: Update task itself
    taskfound.column_id = targetColumnId;
    taskfound.position = targetPosition;
    await taskfound.save();

    return res.status(200).json({ message: "Task moved successfully" });
  } catch (error) {
    console.error("Move Task Error:", error);
    return res.status(500).json({ message: "Couldn't move task", details: error.message });
  }
};



module.exports = { getAllTasks, createtask, gettaskById, edittask, deletetask, moveTask };
