const express = require('express')
const { 
  getUserBoards, 
  createBoard, 
  getBoardById, 
  editBoard, 
  deleteBoard, 
  inviteToBoard, 
  acceptInvitation, 
  declineInvitation, 
  cancelInvitation,
  getPendingInvitations,
  getBoardMembers,
  removeBoardMember,
  updateMemberRole,
  leaveBoard,
  updateBoardBackground
} = require("../controllers/board.controller")
const verifyToken = require('../middlewares/authMiddleware')
const checkBoardAccess = require('../middlewares/checkBoardAccess')
const router = express.Router()

// Board CRUD
router.get("/", verifyToken, getUserBoards)
router.post("/createBoard", verifyToken, createBoard)

// Invitations (must be before /:boardId to avoid route conflicts)
router.get("/invitations/pending", verifyToken, getPendingInvitations)
router.post("/invitation/accept", verifyToken, acceptInvitation)
router.post("/invitation/decline", verifyToken, declineInvitation)
router.post("/invitation/cancel", verifyToken, cancelInvitation)

// Board Members Management (must be before /:boardId to avoid route conflicts)
router.get("/:boardId/members", verifyToken, getBoardMembers)
router.delete("/:boardId/members/:memberId", verifyToken, removeBoardMember)
router.put("/:boardId/members/:memberId/role", verifyToken, updateMemberRole)
router.post("/:boardId/leave", verifyToken, leaveBoard)
router.post("/:boardId/invite", verifyToken, inviteToBoard)

// Board CRUD (specific routes after parameterized routes)
router.get("/:boardId", verifyToken, checkBoardAccess, getBoardById)
router.put("/:boardId", verifyToken, editBoard)
router.put("/:boardId/background", verifyToken, updateBoardBackground)
router.delete("/:boardId", verifyToken, deleteBoard)

module.exports = router