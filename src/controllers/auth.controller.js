const { user } = require("../../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
    const { username, password, email } = req.body;

    // Validation
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (username.length < 3) {
        return res.status(400).json({ message: "Username must be at least 3 characters long" });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
    }

    try {
        // Check if username already exists
        const existingUser = await user.findOne({ where: { username } });
        if (existingUser) {
            return res.status(409).json({ message: "Username already exists" });
        }

        // Check if email already exists (if provided)
        if (email) {
            const existingEmail = await user.findOne({ where: { email } });
            if (existingEmail) {
                return res.status(409).json({ message: "Email already in use" });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const createdUser = await user.create({
            username,
            password: hashedPassword,
            email: email || null
        });

        // Generate JWT so the user is logged in immediately
        const token = jwt.sign({ userId: createdUser.id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        res.status(201).json({
            message: "User registered and logged in",
            token,
            user: { id: createdUser.id, username: createdUser.username, email: createdUser.email }
        });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ message: "Error occurred during registration" });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validation
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        const foundUser = await user.findOne({ where: { username } });

        if (!foundUser) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        const passwordMatch = await bcrypt.compare(password, foundUser.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        const token = jwt.sign({ userId: foundUser.id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        res.status(200).json({
            message: "Login successful",
            token,
            user: { id: foundUser.id, username: foundUser.username, email: foundUser.email }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Login failed" });
    }
};

module.exports = { register, login };
