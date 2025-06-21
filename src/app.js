const express = require('express')
const boards = require("./routes/boards.router")
const columns = require("./routes/columns.router")
const tasks = require("./routes/tasks.router")
const auth = require("./routes/auth.router")
require("dotenv").config()
const app = express()
app.use(express.json())

app.use("/api/boards", boards)
app.use("/api/columns", columns)
app.use("/api/tasks", tasks)
app.use("/api/auth", auth)


module.exports = app