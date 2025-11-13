// routes/assignees.router.js
const express = require('express');
const { getTaskAssignees, assignUserToTask, unassignUserFromTask } = require('../controllers/assignee.controller');
const verifyToken = require('../middlewares/authMiddleware');

const router = express.Router();

// Assignee routes (all require authentication)
router.get('/:taskId/assignees', verifyToken, getTaskAssignees);
router.post('/:taskId/assignees', verifyToken, assignUserToTask);
router.delete('/:taskId/assignees/:userId', verifyToken, unassignUserFromTask);

module.exports = router;

