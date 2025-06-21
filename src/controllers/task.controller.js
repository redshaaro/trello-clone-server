const { task, column, board } = require("../../models");

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

    const createdtask = await task.create({
      title,
      description,
      status,
      column_id
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
  const { title } = req.body;

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

    await task.update({ title }, { where: { id } });

    res.status(200).json({ message: "success", editedtask: title });

  } catch (err) {
    console.log(err);
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

module.exports = { getAlltasks, createtask, gettaskById, edittask, deletetask };
