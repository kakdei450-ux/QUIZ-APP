const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options:  [{ type: String, required: true }],
  answer:   { type: String, required: true },
  category: { type: String, default: 'general',
              enum: ['science','geography','math','technology','general'] }
});

module.exports = mongoose.model('Question', QuestionSchema);