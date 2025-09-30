const { Router } = require('express');
const User = require("../models/User");
const Books = require("../models/Book");
const { getSimilarFromPython } = require("../services/pythonClient");
const { jwtAuthmiddleware } = require('../jwt');
const { default: mongoose } = require('mongoose');

const router = Router();

router.get('/', jwtAuthmiddleware, async (req, res) => {
  try {
    // ✅ userId from decoded token
    const userId = req.userPayload.id;
    if (!userId) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    const user = await User.findById(userId).select('-passwordHash');
    if (!user) return res.status(404).json({ error: "User not found" });

    const liked = (user.likedBooks || []).map(String);

    // get social liked books
    const following = user.following || [];
    const followedUsers = await User.find({ _id: { $in: following } }, 'likedBooks').lean();
    const socialSet = new Set();
    followedUsers.forEach(u => (u.likedBooks || []).forEach(b => socialSet.add(String(b))));

    // get similar books from python service
    let contentIds = [];
    if (liked.length) {
      const { similar } = await getSimilarFromPython(
         'http://127.0.0.1:8000',
        liked,
        50
      );
      contentIds = similar.map(b => String(b.book_id));
    }

    const seen = new Set(liked);
    const merged = [];
    const pushIf = (id) => { if ( !seen.has(id)&& !merged.includes(id)) merged.push(id) };
    // !seen.has(id) &&

    contentIds.forEach(pushIf);
    Array.from(socialSet).forEach(pushIf);

    // fallback random books if not enough
    const topN = 20; // you can tune this
    if (topN > merged.length) {
      const need = topN - merged.length;
      const randoms = await Books.aggregate([
        { $match: { _id: { $nin: merged.map(id => new mongoose.Types.ObjectId(id)) } } },
        { $sample: { size: need } },
        { $project: { _id: 1 } }
      ]);
      randoms.forEach(r => pushIf(String(r._id)));
    }

    // fetch book docs
    const recommendations = await Books.find({ _id: { $in: merged } });

    res.json({ recommendations });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
