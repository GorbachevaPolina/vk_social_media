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
        const { 
            password, 
            updatedAt, 
            createdAt, 
            email, 
            __v, 
            friends,
            friends_req,
            friends_pending,
            ...others} = user._doc;
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

//send friend request to user
router.put("/:id/send-friend-request", authorization, async (req, res) => {
    if(req.params.id !== req.user) {
        try {
            const currentUser = await User.findById(req.user);
            const user = await User.findById(req.params.id);
            if(!user.friends.includes(req.user) && !user.friends_req.includes(req.user)) {
                // await user.updateOne({$push: {friends: req.params.id}})
                // await currentUser.updateOne({$push: {friends: req.user}});
                // res.status(200).json("user has been added to friends list")
                await currentUser.updateOne({$push: {friends_pending: req.params.id}})
                await user.updateOne({$push: {friends_req: req.user}})
                res.status(200).json("The friend request has been sent")
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

//accept friend request
router.put("/:id/accept-friend-request", authorization, async (req, res) => {
    if(req.params.id !== req.user) {
        try {
            const currentUser = await User.findById(req.user);
            const user = await User.findById(req.params.id);
            if (user.friends_pending.includes(req.user) && currentUser.friends_req.includes(req.params.id)) {
                await currentUser.updateOne({$pull: {friends_req: req.params.id}})
                await currentUser.updateOne({$push: {friends: req.params.id}})
                await user.updateOne({$pull: {friends_pending: req.user}})
                await user.updateOne({$push: {friends: req.user}})
                res.status(200).json("The user has been added to friends")
            } else {
                res.status(403).json("Send friend request first")
            }
        } catch (error) {
            res.status(500).json(error)
        }
    } else {
        res.status(403).json("You can't friend yourself")
    }
})

//cancel sent friend request
router.put("/:id/cancel-friend-request", authorization, async (req, res) => {
    if(req.params.id !== req.user) {
        try {
            const currentUser = await User.findById(req.user);
            const user = await User.findById(req.params.id);
            if (user.friends_req.includes(req.user) && currentUser.friends_pending.includes(req.params.id)) {
                await currentUser.updateOne({$pull: {friends_pending: req.params.id}})
                await user.updateOne({$pull: {friends_req: req.user}})
                res.status(200).json("The request has been cancelled")
            } else {
                res.status(403).json("Send friend request first")
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

//get all friends
router.get("/friends/all", authorization, async (req, res) => {
    try {
        const user = await User.findById(req.user);
        const friends = await Promise.all(
            user.friends.map(friendId => {
                return User.findById(friendId)
            })
        );
        res.status(200).json(friends.map(item => {return {
            _id: item._id,
            username: item.username,
            profilePicture: item.profilePicture
        }}))
    } catch (error) {
        res.status(500).json(error)
    }
})

//get all people
router.get("/people/all", authorization, async (req, res) => {
    try {
        const user = await User.findById(req.user);
        const requests = await Promise.all(
            user.friends_req.map(id => {
                return User.findById(id)
            })
        );
        const pending = await Promise.all(
            user.friends_pending.map(id => {
                return User.findById(id)
            })
        );
        const result = {
            friends_req: requests.map(item => {return {
                _id: item._id,
                username: item.username,
                profilePicture: item.profilePicture
            }}),
            friends_pending: pending.map(item => {return {
                _id: item._id,
                username: item.username,
                profilePicture: item.profilePicture
            }})
        }
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json(error)
    }
})

//search by username
router.get("/people/search", async (req, res) => {
    try {
        const { search } = req.query;
        if(search) {
            let users;
            users = await User.aggregate(
                [
                    {
                        '$search': {
                            'index': 'username',
                            'autocomplete': {
                                'query': search,
                                'path': 'username'
                            }
                        }
                    },
                    {
                        '$project': {
                            '_id': 1,
                            'profilePicture': 1,
                            'username': 1
                        }
                    }
                ]
            )
            res.status(200).json(users)
        } else {
            res.status(200).json([])
        }
    } catch (error) {
        res.status(500).json(error)
    }
})
 
module.exports = router;