const express = require('express');
const Score   = require('../models/Score');
const auth    = require('../middleware/auth');
const router  = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { score, total, category } = req.body;
    if (score === undefined || !total)
      return res.status(400).json({ msg: 'Score and total are required' });

    const saved = await Score.create({
      userId: req.user.id,
      score,
      total,
      category: category || 'all'
    });
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const scores = await Score.find({ userId: req.user.id }).sort({ date: -1 });
    const total  = scores.length;
    const best   = total ? Math.max(...scores.map(s => s.score)) : 0;
    const avg    = total ? parseFloat((scores.reduce((a,b) => a + b.score, 0) / total).toFixed(1)) : 0;
    res.json({ scores: scores.slice(0,10), total, best, avg });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;