const express = require('express')
const { createtask, getAlltasks, gettaskById, edittask, deletetask, moveTask } = require("../controllers/task.controller")
const verifyToken = require('../middlewares/authMiddleware')
const router = express.Router()
router.put("/moveTask", verifyToken, moveTask)

router.get("/:columnId", verifyToken, getAlltasks)
router.post("/", verifyToken, createtask)

router.get("/:id", verifyToken, gettaskById)
router.put("/:id", verifyToken, edittask)

router.delete("/:id", verifyToken, deletetask)



module.exports = router