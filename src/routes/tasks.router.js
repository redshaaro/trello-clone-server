const express = require('express')
const { createtask, getAllTasks, gettaskById, edittask, deletetask, moveTask } = require("../controllers/task.controller")
const verifyToken = require('../middlewares/authMiddleware')
const router = express.Router()

// Task operations
router.get("/:id", verifyToken, getAllTasks) // Fixed: removed checkBoardAccess (id is column_id, not board_id)
router.post("/", verifyToken, createtask)
router.get("/gettask/:id", verifyToken, gettaskById)
router.put("/moveTask", verifyToken, moveTask)
router.put("/:id", verifyToken, edittask)
router.delete("/:id", verifyToken, deletetask)

module.exports = router