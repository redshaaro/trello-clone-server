const { column, board, board_member, sequelize } = require("../../models");


const createColumn = async (req, res) => {
    const { name, boardId } = req.body;
    if (!req.user.id) return res.status(401).json({ message: "Unauthorized" });

    // Input validation
    if (!name || name.trim().length === 0) {
        return res.status(400).json({ message: "Column name is required" });
    }

    if (name.length > 100) {
        return res.status(400).json({ message: "Column name must be less than 100 characters" });
    }

    if (!boardId) {
        return res.status(400).json({ message: "Board ID is required" });
    }

    try {
        // Check if user has access to this board (owner or member)
        const foundBoard = await board.findOne({ where: { id: boardId } });
        if (!foundBoard) return res.status(404).json({ message: "Board not found" });

        // Check if user is owner or member
        const isOwner = foundBoard.user_id === req.user.id;
        const isMember = await board_member.findOne({
            where: { board_id: boardId, user_id: req.user.id }
        });

        if (!isOwner && !isMember) {
            return res.status(403).json({ message: "Forbidden: You don't have access to this board" });
        }

        // Check role permissions - VIEWER can't create columns
        if (isMember && isMember.role === 'VIEWER') {
            return res.status(403).json({ message: "Forbidden: Viewers cannot create columns" });
        }

        const foundColumns = await column.findAll({
            where: { board_id: boardId },
            attributes: ['position'],
            order: [['position', 'ASC']]
        });

        let position;
        if (foundColumns.length === 0) {
            position = 0;
        } else {
            position = foundColumns[foundColumns.length - 1].position + 1;
        }

        const createdColumn = await column.create({ name: name.trim(), board_id: boardId, position });
        res.status(201).json({ message: "success", createdColumn });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Couldn't create new column" });
    }
};

const getColumnsByBoard = async (req, res) => {
    const { id } = req.params;
    

    try {
        // const foundBoard = await board.findOne({ where: { id: boardId, user_id: req.user.id } });
        // if (!foundBoard) return res.status(403).json({ message: "Forbidden: Board not found or not yours" });

        const columns = await column.findAll({ 
            where: { board_id: id },
            order: [['position', 'ASC']]
        });
        res.status(200).json({ message: "Success", columns });
    } catch (err) {
        console.error("Error fetching columns:", err);
        res.status(500).json({ message: "Couldn't fetch columns" });
    }
};

const editColumn = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!req.user.id) return res.status(401).json({ message: "Unauthorized" });

    // Input validation
    if (!name || name.trim().length === 0) {
        return res.status(400).json({ message: "Column name is required" });
    }

    if (name.length > 100) {
        return res.status(400).json({ message: "Column name must be less than 100 characters" });
    }

    try {
        const foundColumn = await column.findOne({ 
            where: { id }, 
            include: { model: board } 
        });
        
        if (!foundColumn) return res.status(404).json({ message: "Column not found" });

        // Check if user is owner or member
        const isOwner = foundColumn.board.user_id === req.user.id;
        const isMember = await board_member.findOne({
            where: { board_id: foundColumn.board_id, user_id: req.user.id }
        });

        if (!isOwner && !isMember) {
            return res.status(403).json({ message: "Forbidden: You don't have access to this board" });
        }

        // Check role permissions - VIEWER can't edit columns
        if (isMember && isMember.role === 'VIEWER') {
            return res.status(403).json({ message: "Forbidden: Viewers cannot edit columns" });
        }

        await column.update({ name: name.trim() }, { where: { id } });
        const updated = await column.findByPk(id);
        res.status(200).json({ message: "success", editedColumn: updated });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Couldn't update column" });
    }
};

const deleteColumn = async (req, res) => {
    const { id } = req.params;
    if (!req.user.id) return res.status(401).json({ message: "Unauthorized" });

    try {
        const foundColumn = await column.findOne({ 
            where: { id }, 
            include: { model: board } 
        });
        
        if (!foundColumn) return res.status(404).json({ message: "Column not found" });

        // Check if user is owner or member
        const isOwner = foundColumn.board.user_id === req.user.id;
        const isMember = await board_member.findOne({
            where: { board_id: foundColumn.board_id, user_id: req.user.id }
        });

        if (!isOwner && !isMember) {
            return res.status(403).json({ message: "Forbidden: You don't have access to this board" });
        }

        // Check role permissions - VIEWER and MEMBER can't delete columns, only ADMIN and OWNER
        if (isMember && (isMember.role === 'VIEWER' || isMember.role === 'MEMBER')) {
            return res.status(403).json({ message: "Forbidden: Only admins and owners can delete columns" });
        }

        await column.destroy({ where: { id } });
        res.status(200).json({ message: "success", deletedColumn: id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Couldn't delete column" });
    }
};
const moveColumn = async (req, res) => {
    const { columnId, sourceIndex, targetIndex } = req.body;
    const id = columnId;

    if (!req.user.id) return res.status(401).json({ message: "Unauthorized" });

    if (sourceIndex === undefined || targetIndex === undefined) {
        return res.status(400).json({ message: "Missing source or target position" });
    }

    try {
        // Find the column
        const foundColumn = await column.findOne({
            where: { id },
            include: { model: board }
        });

        if (!foundColumn) {
            return res.status(404).json({ message: "Column not found" });
        }

        const boardId = foundColumn.board_id;

        // Check if user is owner or member
        const isOwner = foundColumn.board.user_id === req.user.id;
        const isMember = await board_member.findOne({
            where: { board_id: boardId, user_id: req.user.id }
        });

        if (!isOwner && !isMember) {
            return res.status(403).json({ message: "Forbidden: You don't have access to this board" });
        }

        // Check role permissions - VIEWER can't move columns
        if (isMember && isMember.role === 'VIEWER') {
            return res.status(403).json({ message: "Forbidden: Viewers cannot move columns" });
        }

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
