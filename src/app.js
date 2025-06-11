const express = require('express')
const boards = require("./routes/boards.router")
const columns = require("./routes/columns.router")
const tasks = require("./routes/tasks.router")
const app = express()
app.use(express.json())
app.use("/api/boards", boards)
app.use("/api/columns", columns)
app.use("/api/tasks", tasks)


module.exports = app