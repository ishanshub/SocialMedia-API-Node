const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcrypt");

//update
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("Account has been updated");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can update only your account!");
  }
});

//delete
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Account has been deleted!");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can only delete your account!");
  }
});

//get a user
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, updatedAt, ...others } = user._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

//follow a user
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const fromUser = await User.findById(req.params.id);
      const toUser = await User.findById(req.body.userId);

      if (!toUser.followers.includes(req.params.id)) {
        //follow
        await fromUser.updateOne({ $push: { followings: req.body.userId } });
        await toUser.updateOne({ $push: { followers: req.params.id } });
        res.status(200).json("user has been followed");
      } else {
        //unfollow
        await fromUser.updateOne({ $pull: { followings: req.body.userId } });
        await toUser.updateOne({ $pull: { followers: req.params.id } });
        res.status(200).json("user has been unfollowed");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you can not follow yourself");
  }
});

module.exports = router;
