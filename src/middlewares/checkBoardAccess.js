// middleware/checkBoardAccess.js
const { board, board_member } = require("../../models");

const checkBoardAccess = async (req, res, next) => {
    const userId = req.user.id;

    // Support both :id and :boardId parameter names
    const boardId = req.params.boardId || req.params.id || req.body.boardId || req.body.id;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!boardId) return res.status(400).json({ message: "Board ID is required" });

    try {
        // 1️⃣ Check if the user is the owner
        const ownedBoard = await board.findOne({ where: { id: boardId, user_id: userId } });
        if (ownedBoard) {
            req.board = ownedBoard; // pass board info forward
            req.userRole = 'OWNER'; // attach user role
            return next();
        }

        // 2️⃣ Check if the user is a member
        const memberRecord = await board_member.findOne({
            where: { board_id: boardId, user_id: userId },
        });

        if (memberRecord) {
            const boardInfo = await board.findByPk(boardId);
            req.board = boardInfo; // attach board info
            req.userRole = memberRecord.role; // attach user role
            return next();
        }

        return res.status(403).json({ message: "Forbidden: Not allowed to access this board" });
    } catch (err) {
        console.error("Board access error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = checkBoardAccess;
