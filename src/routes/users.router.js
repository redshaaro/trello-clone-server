// routes/userRoutes.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { user } = require("../../models");
const nodemailer = require("nodemailer")

const auth = require("../middlewares/authMiddleware");

const router = express.Router();


// 👉 Forgot Password
router.post("/forgot-password", async (req, res) => {
    const { sendPasswordResetEmail } = require("../utils/sendEmail");
    
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        const founduser = await user.findOne({ where: { email } });
        
        // For security, don't reveal if user exists
        if (!founduser) {
            // Still return success to prevent email enumeration
            return res.json({ message: "If that email exists, a password reset link has been sent" });
        }

        // Generate reset token (JWT)
        const resetToken = jwt.sign(
            { id: founduser.id, email: founduser.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" } // Increased to 1 hour
        );

        // Save token + expiry in DB
        founduser.resetPasswordToken = resetToken;
        founduser.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
        await founduser.save();

        // Send email using utility function
        try {
            await sendPasswordResetEmail(email, resetToken, founduser.username);
            return res.json({ message: "Password reset email sent successfully" });
        } catch (emailError) {
            console.error("❌ Email sending failed:", emailError);
            // Clear the token since email failed
            founduser.resetPasswordToken = null;
            founduser.resetPasswordExpires = null;
            await founduser.save();
            
            return res.status(500).json({ 
                error: "Failed to send password reset email. Please check email configuration.",
                details: emailError.message 
            });
        }
    } catch (err) {
        console.error("❌ Forgot Password Error:", err);
        res.status(500).json({ error: "Something went wrong" });
    }
});
// 👉 Reset Password (with token from email)
router.post("/reset-password", async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // 1️⃣ Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ error: "Invalid or expired token" });
        }

        // 2️ Find user
        const foundUser = await user.findOne({ where: { id: decoded.id } });
        if (!foundUser) {
            return res.status(404).json({ error: "User not found" });
        }

        // 3️⃣ Check token expiry (optional if you store in DB)
        if (foundUser.resetPasswordExpires && foundUser.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ error: "Token expired" });
        }

        // 4️⃣ Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 5️⃣ Save user with new password + clear reset fields
        foundUser.password = hashedPassword;
        foundUser.resetPasswordToken = null;
        foundUser.resetPasswordExpires = null;
        await foundUser.save();

        res.json({ message: "Password reset successfully" });
    } catch (err) {
        console.error("❌ Reset Password Error:", err);
        res.status(500).json({ error: "Something went wrong" });
    }
});



// 👉 Change Password (authenticated)
router.post("/change-password", auth, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const validPassword = await bcrypt.compare(oldPassword, req.user.password);

    if (!validPassword) return res.status(400).json({ error: "Old password incorrect" });
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    req.user.password = hashedNewPassword;
    await req.user.save();

    res.json({ message: "Password updated successfully" });
});


// 👉 Edit username
router.put("/edit-username", auth, async (req, res) => {
    const { newusername } = req.body;
    
    if (!newusername || newusername.trim().length < 3) {
        return res.status(400).json({ error: "Username must be at least 3 characters long" });
    }

    const exists = await user.findOne({ where: { username: newusername } });
    if (exists) return res.status(400).json({ error: "username already taken" });

    req.user.username = newusername;
    await req.user.save();

    res.json({ message: "username updated", username: req.user.username });
});


// 👉 Update Email
router.put("/edit-email", auth, async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        // Check if email is already in use
        const exists = await user.findOne({ where: { email } });
        if (exists && exists.id !== req.user.id) {
            return res.status(400).json({ error: "Email already in use" });
        }

        req.user.email = email;
        await req.user.save();

        res.json({ message: "Email updated successfully", email: req.user.email });
    } catch (err) {
        console.error("Update email error:", err);
        res.status(500).json({ error: "Failed to update email" });
    }
});


// 👉 Delete Account
router.delete("/delete-account", auth, async (req, res) => {
    await req.user.destroy();
    res.json({ message: "Account deleted successfully" });
});


module.exports = router;
