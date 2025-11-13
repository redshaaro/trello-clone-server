const express = require('express')
const boards = require("./routes/boards.router")
const columns = require("./routes/columns.router")
const tasks = require("./routes/tasks.router")
const auth = require("./routes/auth.router")
const userRoutes = require("./routes/users.router");
const comments = require("./routes/comments.router");
const labels = require("./routes/labels.router");
const assignees = require("./routes/assignees.router");

const cors = require("cors")
require("dotenv").config()
const app = express()
app.use(express.json())
app.use(cors());

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ 
        status: "ok", 
        message: "Server is running",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Email configuration test endpoint (development only)
if (process.env.NODE_ENV !== 'production') {
    app.get("/test-email", async (req, res) => {
        const { testEmailConfiguration } = require("./utils/sendEmail");
        
        try {
            const isConfigured = await testEmailConfiguration();
            
            if (isConfigured) {
                res.json({
                    success: true,
                    message: "✅ Email service is configured and ready",
                    config: {
                        service: process.env.EMAIL_SERVICE || 'gmail',
                        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
                        port: process.env.EMAIL_PORT || 587,
                        user: process.env.EMAIL_USER ? '***' + process.env.EMAIL_USER.slice(-10) : 'NOT SET',
                        hasPassword: !!process.env.EMAIL_PASS,
                        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
                    }
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: "❌ Email service is NOT configured properly",
                    config: {
                        service: process.env.EMAIL_SERVICE || 'NOT SET',
                        host: process.env.EMAIL_HOST || 'NOT SET',
                        port: process.env.EMAIL_PORT || 'NOT SET',
                        user: process.env.EMAIL_USER || 'NOT SET',
                        hasPassword: !!process.env.EMAIL_PASS,
                        frontendUrl: process.env.FRONTEND_URL || 'NOT SET'
                    },
                    help: "Configure EMAIL_USER, EMAIL_PASS, and other email variables in .env"
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "❌ Error testing email configuration",
                error: error.message
            });
        }
    });
}

app.use("/api/boards", boards)
app.use("/api/columns", columns)
app.use("/api/tasks", tasks)
app.use("/api/users", userRoutes);
app.use("/api/tasks", comments); // Task comments routes
app.use("/api/tasks", labels); // Task labels routes
app.use("/api/tasks", assignees); // Task assignees routes

app.use("/api/auth", auth)


module.exports = app