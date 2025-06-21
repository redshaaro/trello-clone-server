const express = require('express')
const { getAllBoards, createBoard, getBoardById, editBoard, deleteBoard } = require("../controllers/board.controller")
const verifyToken = require('../middlewares/authMiddleware')
const router = express.Router()
router.get("/", verifyToken, getAllBoards)
router.post("/", verifyToken, createBoard)
router.get("/:id", verifyToken, getBoardById)

router.put("/:id", verifyToken, editBoard)
router.delete("/:id",verifyToken, deleteBoard)
module.exports = router