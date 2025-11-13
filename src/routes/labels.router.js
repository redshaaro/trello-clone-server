// routes/labels.router.js
const express = require('express');
const { getTaskLabels, addLabelToTask, removeLabelFromTask } = require('../controllers/label.controller');
const verifyToken = require('../middlewares/authMiddleware');

const router = express.Router();

// Label routes (all require authentication)
router.get('/:taskId/labels', verifyToken, getTaskLabels);
router.post('/:taskId/labels', verifyToken, addLabelToTask);
router.delete('/:taskId/labels/:labelId', verifyToken, removeLabelFromTask);

module.exports = router;

