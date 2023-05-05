const router = require("express").Router();
const User = require("../models/User.js")

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

//get user
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const { password, updatedAt, ...others } = user._doc;
        res.status(200).json(others)
    } catch (error) {
        res.status(500).json(error)
    }
})

//add user to friends
router.put("/:id/add-friend", async (req, res) => {
    if(req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if(!user.friends.includes(req.body.userId)) {
                await user.updateOne({$push: {friends: req.body.userId}})
                await currentUser.updateOne({$push: {friends: req.params.id}});
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
router.put("/:id/delete-friend", async (req, res) => {
    if(req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if(user.friends.includes(req.body.userId)) {
                await user.updateOne({$pull: {friends: req.body.userId}})
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