const router = require("express").Router();
const User = require('../models/User.js');
const bcrypt = require("bcrypt");

//register
router.post("/register", async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt)
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            city: req.body.city,
            age: req.body.age,
            university: req.body.university
        })
        const user = await newUser.save()
        res.status(200).json(user)
    } catch (error) {
        res.status(500).json(error)
    }
});

//login
router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({email: req.body.email});
        if (!user) {
            res.status(404).send("User not found")
        }
        const validPassword = await bcrypt.compare(req.body.password, user.password)
        if(!validPassword) {
            res.status(400).send("Wrong password")
        }
        res.status(200).json(user)
    } catch (error) {
        res.status(500).json(error)
    }
})

module.exports = router;