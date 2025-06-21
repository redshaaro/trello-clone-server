const { board } = require("../../models")
const getAllBoards = async (req, res) => {
    try {
        if (!req.userId) return res.status(401).json({ message: "unauthorized access" })
        const boards = await board.findAll({ where: { user_id: req.userId } })
        res.status(200).json({ message: "success", boards })

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Coudn't fetch boards" })

    }

}
const createBoard = async (req, res) => {
    const { name } = req.body
    if (!req.userId) return res.status(401).json({ message: "unauthorized access" })



    try {

        const createdboard = await board.create({
            name: name,
            user_id: req.userId

        })
        console.log(createdboard.dataValues)
        res.status(200).json({ message: "success", createdboard: createdboard.dataValues })

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Coudn't create new board" })

    }

}
const getBoardById = async (req, res) => {
    const { id } = req.params
    if (!req.userId) return res.status(401).json({ message: "unauthorized access" })


    try {
        const found = await board.findAll({
            where: { id: id, user_id: req.userId }


        })

        res.status(200).json({ message: "success", board: found })

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Coudn't create new board" })

    }

}
const editBoard = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!req.userId) return res.status(401).json({ message: "Unauthorized access" });

    try {
        const [affectedRows] = await board.update(
            { name },
            {
                where: {
                    id,
                    user_id: req.userId,
                },
            }
        );

        if (affectedRows === 0) {
            return res.status(403).json({ message: "Forbidden: You do not have permission to edit this board" });
        }

        res.status(200).json({ message: "Success", editedboard: { id, name } });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Couldn't update board" });
    }
};

const deleteBoard = async (req, res) => {
    const { id } = req.params;

    if (!req.userId) return res.status(401).json({ message: "Unauthorized access" });

    try {
        const deleted = await board.destroy({
            where: { id, user_id: req.userId },
        });

        if (deleted === 0) {
            return res.status(403).json({ message: "Forbidden: You do not have permission to delete this board" });
        }

        res.status(200).json({ message: "Success", deletedboard: id });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Couldn't delete board" });
    }
};

module.exports = { getAllBoards, createBoard, getBoardById, editBoard, deleteBoard }