const { column, board } = require("../../models");

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

module.exports = { createColumn, getColumnsByBoard, editColumn, deleteColumn };
