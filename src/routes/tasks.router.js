const express = require('express')
const { createtask, getAlltasks, gettaskById, edittask, deletetask } = require("../controllers/task.controller")
const verifyToken = require('../middlewares/authMiddleware')
const router = express.Router()

router.get("/", verifyToken, getAlltasks)
router.post("/", createtask)

router.get("/:id", gettaskById)
router.put("/:id", edittask)
router.delete("/:id", deletetask)



module.exports = router