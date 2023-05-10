const router = require("express").Router();
const multer = require('multer');
const User = require('../models/User.js');
const bcrypt = require("bcrypt");
const jwtGenerator = require('../utils/jwtGenerator.js')

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './tmp/uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + file.originalname)
    }
})
const upload = multer({storage: storage})

//register
router.post("/register", upload.single("image"), async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt)
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            city: req.body.city,
            age: req.body.age,
            university: req.body.university,
            profilePicture: req.file ? req.file.path : ""
        })
        const user = await newUser.save()

        const token = jwtGenerator(user.id);
        const info = {
            _id: user._id,
            username: user.username,
            city: user.city,
            age: user.age,
            university: user.university,
            profilePicture: user.profilePicture
        }
        res.status(200).json({token, info});
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

        const token = jwtGenerator(user.id)
        const info = {
            _id: user._id,
            username: user.username,
            city: user.city,
            age: user.age,
            university: user.university,
            profilePicture: user.profilePicture
        }
        res.status(200).json({token, info})
    } catch (error) {
        res.status(500).json(error)
    }
})

module.exports = router;