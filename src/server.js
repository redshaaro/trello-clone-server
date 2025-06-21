const app = require("./app")
const { sequelize } = require("../models")

sequelize.sync({ alter: true }).then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`running from ${process.env.PORT}`)
    })

})

