const express = require('express')
const { getColumnsByBoard, createColumn, editColumn, deleteColumn ,moveColumn} = require("../controllers/column.controller")
const verifyToken = require('../middlewares/authMiddleware')
const router = express.Router()
router.post("/",verifyToken, createColumn)
router.put("/moveColumn", verifyToken, moveColumn);

router.get("/:boardId", verifyToken, getColumnsByBoard)




router.put("/:id",verifyToken, editColumn)

router.delete("/:id",verifyToken, deleteColumn)
module.exports = router