// routes/comments.router.js
const express = require('express');
const { getTaskComments, addComment, deleteComment } = require('../controllers/comment.controller');
const verifyToken = require('../middlewares/authMiddleware');

const router = express.Router();

// Comment routes (all require authentication)
router.get('/:taskId/comments', verifyToken, getTaskComments);
router.post('/:taskId/comments', verifyToken, addComment);
router.delete('/:taskId/comments/:commentId', verifyToken, deleteComment);

module.exports = router;

