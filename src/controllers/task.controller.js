const { task, column, board } = require("../../models");
const { Op } = require("sequelize");

const { sequelize } = require("../../models"); // adjust path as needed


// ✅ GET all tasks for a specific column (and verify it's the user's board)
const getAlltasks = async (req, res) => {
  const { columnId } = req.params;
  try {
    const foundColumn = await column.findOne({
      where: { id: columnId },
      include: {
        model: board,
        where: { user_id: req.userId }
      }
    });

    if (!foundColumn) {
      return res.status(403).json({ message: "Forbidden: Column not found or not yours" });
    }

    const tasks = await task.findAll({ where: { column_id: columnId } });
    res.status(200).json({ message: "success", tasks });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Couldn't fetch tasks" });
  }
};

// ✅ CREATE task in a column that belongs to the user
const createtask = async (req, res) => {
  const { title, description, status, column_id } = req.body;

  try {
    const foundColumn = await column.findOne({
      where: { id: column_id },
      include: {
        model: board,
        where: { user_id: req.userId }
      }
    });

    if (!foundColumn) {
      return res.status(403).json({ message: "Forbidden: Column not found or not yours" });
    }
    const lastTask = await task.findOne({
      where: { column_id },
      order: [['position', 'DESC']]
    });

    const newPosition = lastTask ? lastTask.position + 1 : 0;

    const createdtask = await task.create({
      title,
      description,
      status,
      column_id,
      position: newPosition
    });



    res.status(200).json({ message: "success", createdtask: createdtask.dataValues });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Couldn't create task" });
  }
};

// ✅ GET task by ID if it belongs to the user
const gettaskById = async (req, res) => {
  const { id } = req.params;
  console.log("hello from get task by id")

  console.log(id)

  try {
    const foundTask = await task.findOne({
      where: { id },
      include: {
        model: column,
        include: {
          model: board,
          where: { user_id: req.userId }
        }
      }
    });

    if (!foundTask) {
      return res.status(403).json({ message: "Forbidden: Task not found or not yours" });
    }

    res.status(200).json({ message: "success", task: foundTask });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Couldn't fetch task" });
  }
};

// ✅ UPDATE task title if it's in a board of the current user
const edittask = async (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;

  try {
    // make sure the task belongs to the user
    const foundTask = await task.findOne({
      where: { id },
      include: {
        model: column,
        include: {
          model: board,
          where: { user_id: req.userId }
        }
      }
    });

    if (!foundTask) {
      return res.status(403).json({ message: "Forbidden: Task not found or not yours" });
    }

    // update only allowed fields
    await task.update(
      { title, description, status },
      { where: { id } }
    );

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
        include: {
          model: board,
          where: { user_id: req.userId }
        }
      }
    });

    if (!foundTask) {
      return res.status(403).json({ message: "Forbidden: Task not found or not yours" });
    }

    await task.destroy({ where: { id } });

    res.status(200).json({ message: "success", deletedtask: id });

  } catch (err) {
    console.log(err);
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

    const taskfound = await task.findByPk(taskId);
    if (!taskfound) {
      return res.status(404).json({ error: "Task not found" });
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



module.exports = { getAlltasks, createtask, gettaskById, edittask, deletetask, moveTask };
