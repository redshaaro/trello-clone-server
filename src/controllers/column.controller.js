const { column } = require("../../models")
const createColumn = async (req, res) => {
    const { name } = req.body
    console.log(name)

    try {
        const createdColumn = await column.create({
            name: name,
            board_id: 3

        })

        res.status(200).json({ message: "success", createdcolumn: createColumn.dataValues })

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Coudn't create new column " })

    }

}
const getAllColumns = async (req, res) => {
    try {
        const columns = await column.findAll()
        res.status(200).json({ message: "success", columns })

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Coudn't fetch columns" })

    }

}
const editColumn = async (req, res) => {
    const { id } = req.params
    const { name } = req.body


    try {
        const updated = await column.update({ name: name }, { where: { id: id } })
        console.log(updated)

        res.status(200).json({ message: "success", editedcolumn: updated })

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Coudn't update column" })

    }

}
const deleteColumn = async (req, res) => {
    const { id } = req.params



    try {
        const deleted = await column.destroy({ where: { id: id } })
        console.log(deleted)

        res.status(200).json({ message: "success", deletedcolumn: deleted })

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Coudn't delete board" })

    }

}
module.exports = { createColumn, getAllColumns, editColumn, deleteColumn }