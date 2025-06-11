const express = require('express')
const { getAllColumns, createColumn, editColumn, deleteColumn } = require("../controllers/column.controller")
const router = express.Router()
router.get("/", getAllColumns)
router.post("/", createColumn)
 

router.put("/:id", editColumn)
router.delete("/:id", deleteColumn)
module.exports = router