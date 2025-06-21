
const { user } = require("../../models")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const register = async (req, res) => {
    const { username, password } = req.body
    try {
        const hashedpassword = await bcrypt.hash(password, 3)
        const createduser = await user.create({
            username: username,
            password: hashedpassword
        })
        res.status(201).json({ createduser: createduser.dataValues })


    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "error occured" })
    }


}
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        // console.log(username)
        const founduser = await user.findOne({ where: { username: username } });
        console.log("this is the user : " + founduser.data)
        if (!founduser) {
            return res.status(401).json({ error: 'Authentication failed' });
        }
        const passwordMatch = await bcrypt.compare(password, founduser.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Authentication failed' });
        }
        const token = jwt.sign({ userId: founduser.id }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });
        res.status(200).json({ token });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Login failed' });
    }

}
module.exports = { register, login }