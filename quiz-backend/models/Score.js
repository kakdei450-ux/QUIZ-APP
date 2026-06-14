const mongoose = require('mongoose');

const ScoreSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score:    { type: Number, required: true },
  total:    { type: Number, required: true },
  category: { type: String, default: 'all' },
  date:     { type: Date, default: Date.now }
});

module.exports = mongoose.model('Score', ScoreSchema);