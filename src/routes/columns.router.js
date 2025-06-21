const express = require('express')
const { getColumnsByBoard, createColumn, editColumn, deleteColumn } = require("../controllers/column.controller")
const verifyToken = require('../middlewares/authMiddleware')
const router = express.Router()
router.get("/:boardId", verifyToken, getColumnsByBoard)
router.post("/",verifyToken, createColumn)


router.put("/:id",verifyToken, editColumn)
router.delete("/:id",verifyToken, deleteColumn)
module.exports = router