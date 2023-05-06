const router = require("express").Router();
const User = require("../models/User.js")
const authorization = require("../middleware/authorization.js")

//update user
// router.put("/:id", async (req, res) => {
//     if(req.body.userId === req.params.id) {
//         if(req.body.password) {
//             try {
                
//             } catch (error) {
                
//             }
//         }
//     } else {
//         return res.status(403).json("You can only update you account")
//     }
// })

//get yourself
router.get("/", authorization, async (req, res) => {
    try {
        const user = await User.findById(req.user);
        const { password, updatedAt, createdAt, email, __v, ...others} = user._doc;
        res.status(200).json(others)
    } catch (error) {
        res.status(500).json(error)
    }
})

//get other user
router.get("/:id", authorization, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const { password, updatedAt, email, friends_req, ...others } = user._doc;
        res.status(200).json(others)
    } catch (error) {
        res.status(500).json(error)
    }
})

//add user to friends
router.put("/:id/add-friend", authorization, async (req, res) => {
    if(req.params.id !== req.user) {
        try {
            const user = await User.findById(req.user);
            const currentUser = await User.findById(req.params.id);
            if(!user.friends.includes(req.params.id)) {
                await user.updateOne({$push: {friends: req.params.id}})
                await currentUser.updateOne({$push: {friends: req.user}});
                res.status(200).json("user has been added to friends list")
            } else {
                res.status(403).json("You are already friends")
            }
        } catch (error) {
            res.status(500).json(error)
        }
    } else {
        res.status(403).json("You can't friend yourself")
    }
})

//delete user from friends
router.put("/:id/delete-friend", authorization, async (req, res) => {
    if(req.params.id !== req.user) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.user);
            if(user.friends.includes(req.user)) {
                await user.updateOne({$pull: {friends: req.user}})
                await currentUser.updateOne({$pull: {friends: req.params.id}});
                res.status(200).json("user has been deleted from friends list")
            } else {
                res.status(403).json("You are already not friends")
            }
        } catch (error) {
            res.status(500).json(error)
        }
    } else {
        res.status(403).json("You can't unfriend yourself")
    }
})
 
module.exports = router;