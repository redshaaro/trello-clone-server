const express = require('express')
const { getColumnsByBoard, createColumn, editColumn, deleteColumn ,moveColumn} = require("../controllers/column.controller")
const verifyToken = require('../middlewares/authMiddleware')
const checkBoardAccess = require('../middlewares/checkBoardAccess')
const router = express.Router()
router.post("/", verifyToken, createColumn)
router.put("/moveColumn", verifyToken, moveColumn);

// Note: :id here is boardId, not columnId
router.get("/:id", verifyToken, checkBoardAccess, getColumnsByBoard)




router.put("/:id",verifyToken, editColumn)

router.delete("/:id",verifyToken, deleteColumn)
module.exports = router