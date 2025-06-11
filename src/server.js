const app=require("./app")
const {sequelize}=require("../models")
sequelize.sync({alter:true}).then(()=>{
    app.listen("3000",()=>{
    console.log("hello from server")
})

})

