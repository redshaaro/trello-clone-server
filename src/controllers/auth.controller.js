const { user } = require("../../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const createdUser = await user.create({
            username,
            password: hashedPassword
        });
        console.log(createdUser)

        // Generate JWT so the user is logged in immediately
        const token = jwt.sign({ userId: createdUser.id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        res.status(201).json({
            message: "User registered and logged in",
            token,
            user: { id: createdUser.id, username: createdUser.username }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error occurred during registration" });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const foundUser = await user.findOne({ where: { username } });

        if (!foundUser) {
            return res.status(401).json({ error: "Authentication failed" });
        }

        const passwordMatch = await bcrypt.compare(password, foundUser.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: "Authentication failed" });
        }

        const token = jwt.sign({ userId: foundUser.id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        res.status(200).json({
            message: "Login successful",
            token,
            user: { id: foundUser.id, username: foundUser.username }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Login failed" });
    }
};

module.exports = { register, login };
