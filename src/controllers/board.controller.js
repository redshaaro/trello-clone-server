const { board } = require("../../models")
const getAllBoards = async (req, res) => {
    try {
        const boards = await board.findAll()
        res.status(200).json({ message: "success", boards })

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Coudn't fetch boards" })

    }

}
const createBoard = async (req, res) => {
    const { name } = req.body
    console.log(name)

    try {
        const createdboard = await board.create({
            name: name,
            user_id: 1

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
    console.log(id)

    try {
        const found = await board.findAll({
            where: { id: id }


        })

        res.status(200).json({ message: "success", board: found })

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Coudn't create new board" })

    }

}
const editBoard = async (req, res) => {
    const { id } = req.params
    const { name } = req.body


    try {
        const updated = await board.update({ name: name }, { where: { id: id } })
        console.log(updated)

        res.status(200).json({ message: "success", editedboard: updated })

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Coudn't create new board" })

    }

}
const deleteBoard = async (req, res) => {
    const { id } = req.params



    try {
        const deleted = await board.destroy({ where: { id: id } })
        console.log(deleted)

        res.status(200).json({ message: "success", deletedboard: deleted })

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Coudn't create new board" })

    }

}

module.exports = { getAllBoards, createBoard, getBoardById, editBoard ,deleteBoard}