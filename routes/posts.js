const router = require("express").Router();
const multer = require('multer');
const path = require('path');
const Post = require("../models/Post.js")
const User = require("../models/User.js")
const authorization = require("../middleware/authorization.js")

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + file.originalname)
    }
})
const upload = multer({storage: storage})

//create a post
router.post("/", authorization, upload.single('image'), async (req, res) => {
    try {
        const newPost = new Post({
            userId: req.user, 
            image: req.file ? req.file.path : "",
            ...req.body
        });
        const savedPost = await newPost.save();
        res.status(200).json(savedPost)
    } catch (error) {
        res.status(500).json(error)
    }
})

//like and unlike a post
router.put("/:id/like", authorization, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post.likes.includes(req.user)) {
            await post.updateOne({ $push: { likes: req.user } });
            // res.status(200).json("The post has been liked")
        } else {
            await post.updateOne({ $pull: { likes: req.user } });
            // res.status(200).json("The post has been unliked")
        }
        res.status(200).json(req.user)
    } catch (error) {
        res.status(500).json(error)
    }
})

//get user posts
router.get("/personal-posts", authorization, async (req, res) => {
    try {
        const userPosts = await Post.find({ userId: req.user });
        res.status(200).json(userPosts)
    } catch (error) {
        res.status(500).json(error)
    }
})

//get all friend posts
router.get("/timeline", authorization, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user);
        // const userPosts = await Post.find({ userId: currentUser.id });
        const friendPosts = await Promise.all(
            currentUser.friends.map(friendId => {
                return Post.find({userId: friendId})
            })
        );
        res.status(200).json(friendPosts)
    } catch (error) {
        res.status(500).json(error)
    }
})

module.exports = router;