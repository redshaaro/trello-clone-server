const express = require('express')
const { getAllBoards, createBoard, getBoardById, editBoard, deleteBoard } = require("../controllers/board.controller")
const router = express.Router()
router.get("/", getAllBoards)
router.post("/", createBoard)
router.get("/:id", getBoardById)

router.put("/:id", editBoard)
router.delete("/:id", deleteBoard)
module.exports = router