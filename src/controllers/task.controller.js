const { task } = require("../../models")

const getAlltasks = async (req, res) => {
    try {
        const tasks = await task.findAll()
        res.status(200).json({ message: "success", tasks })

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Coudn't fetch tasks" })

    }

}
const createtask = async (req, res) => {
    const { title, description, status } = req.body


    try {
        const createdtask = await task.create({
            title: title,
            description: description,
            status: status,
            column_id: 2

        })
        console.log(createdtask.dataValues)
        res.status(200).json({ message: "success", createdtask: createdtask.dataValues })

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Coudn't create new task" })

    }

}
const gettaskById = async (req, res) => {
    const { id } = req.params
    console.log(id)

    try {
        const found = await task.findAll({
            where: { id: id }


        })

        res.status(200).json({ message: "success", task: found })

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Coudn't create new task" })

    }

}
const edittask = async (req, res) => {
    const { id } = req.params
    const { title } = req.body


    try {
        const updated = await task.update({ title: title }, { where: { id: id } })
        console.log(updated)

        res.status(200).json({ message: "success", editedtask: updated })

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Coudn't create new task" })

    }

}
const deletetask = async (req, res) => {
    const { id } = req.params



    try {
        const deleted = await task.destroy({ where: { id: id } })
        console.log(deleted)

        res.status(200).json({ message: "success", deletedtask: deleted })

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Coudn't create new task" })

    }

}

module.exports = { getAlltasks, createtask, gettaskById, edittask, deletetask }