const jwt = require('jsonwebtoken');
const { user } = require("../../models")
async function verifyToken(req, res, next) {
    const authHeader = req.header("Authorization");
    if (!authHeader) return res.status(401).json({ error: "Access denied" });

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);


        const foundUser = await user.findByPk(decoded.userId);
          
        if (!foundUser) return res.status(401).json({ error: "User not found" });

        req.user = foundUser; // now you can use req.user anywhere
       
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid token" });
    }
}

module.exports = verifyToken;