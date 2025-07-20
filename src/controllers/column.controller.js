const { column, board, sequelize } = require("../../models");


const createColumn = async (req, res) => {
    const { name, boardId } = req.body;
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    try {

        const foundBoard = await board.findOne({ where: { id: boardId, user_id: req.userId } });
        if (!foundBoard) return res.status(403).json({ message: "Forbidden: Board not found or not yours" });

        const createdColumn = await column.create({ name, board_id: boardId });
        res.status(200).json({ message: "success", createdColumn: createdColumn.dataValues });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Couldn't create new column" });
    }
};

const getColumnsByBoard = async (req, res) => {
    const { boardId } = req.params;
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    try {
        const foundBoard = await board.findOne({ where: { id: boardId, user_id: req.userId } });
        if (!foundBoard) return res.status(403).json({ message: "Forbidden: Board not found or not yours" });

        const columns = await column.findAll({ where: { board_id: boardId } });
        res.status(200).json({ message: "Success", columns });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Couldn't fetch columns" });
    }
};

const editColumn = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    try {
        const foundColumn = await column.findOne({ where: { id }, include: { model: board, where: { user_id: req.userId } } });
        if (!foundColumn) return res.status(403).json({ message: "Forbidden: Column not found or not yours" });

        const updated = await column.update({ name }, { where: { id } });
        res.status(200).json({ message: "success", editedColumn: updated });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Couldn't update column" });
    }
};

const deleteColumn = async (req, res) => {
    const { id } = req.params;
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    try {
        const foundColumn = await column.findOne({ where: { id }, include: { model: board, where: { user_id: req.userId } } });
        if (!foundColumn) return res.status(403).json({ message: "Forbidden: Column not found or not yours" });

        const deleted = await column.destroy({ where: { id } });
        res.status(200).json({ message: "success", deletedColumn: deleted });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Couldn't delete column" });
    }
};
const moveColumn = async (req, res) => {
    

    const {columnId, sourceIndex, targetIndex } = req.body;
    const id=columnId
    console.log("BODY:", req.body);

    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    if (sourceIndex === undefined || targetIndex === undefined) {
        return res.status(400).json({ message: "Missing source or target position" });
    }

    try {
        // Ensure the column belongs to the logged-in user
        const foundColumn = await column.findOne({
            where: { id },
            include: {
                model: board,
                where: { user_id: req.userId },
            },
        });

        if (!foundColumn) {
            return res.status(403).json({ message: "Forbidden: Column not found or not yours" });
        }

        const boardId = foundColumn.board_id;

        await sequelize.transaction(async (t) => {
            // Fetch all columns of the board in order
            const allColumns = await column.findAll({
                where: { board_id: boardId },
                order: [['position', 'ASC']],
                transaction: t,
            });

            // Make sure source/target are within bounds
            if (
                sourceIndex < 0 ||
                sourceIndex >= allColumns.length ||
                targetIndex < 0 ||
                targetIndex >= allColumns.length
            ) {
                throw new Error("Invalid position values");
            }

            const [movedColumn] = allColumns.splice(sourceIndex, 1);
            allColumns.splice(targetIndex, 0, movedColumn);

            // Reassign positions
            const updates = allColumns.map((col, index) => {
                if (col.position !== index) {
                    col.position = index;
                    return col.save({ transaction: t });
                }
            }).filter(Boolean); // remove undefined

            await Promise.all(updates);
        });

        res.status(200).json({ message: "Column moved successfully" });
    } catch (err) {
        console.error("Error in moveColumn:", err);
        res.status(500).json({ message: "Couldn't move column" });
    }
};

module.exports = { createColumn, getColumnsByBoard, editColumn, deleteColumn, moveColumn };
