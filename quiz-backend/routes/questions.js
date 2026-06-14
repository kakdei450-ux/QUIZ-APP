const express  = require('express');
const Question = require('../models/Question');
const auth     = require('../middleware/auth');
const router   = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { category, limit = 10 } = req.query;
    let filter = {};
    if (category && category !== 'all') filter.category = category;
    const questions = await Question.aggregate([
      { $match: filter },
      { $sample: { size: parseInt(limit) } }
    ]);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/seed', async (req, res) => {
  try {
    await Question.deleteMany({});
    const questions = [
      { question:"What is the capital of India?",            options:["Mumbai","Delhi","Pune","Chennai"],              answer:"Delhi",       category:"geography" },
      { question:"Which is the longest river in the world?", options:["Amazon","Nile","Yangtze","Mississippi"],        answer:"Nile",        category:"geography" },
      { question:"Which country has the largest population?",options:["USA","China","India","Russia"],                 answer:"India",       category:"geography" },
      { question:"What is the capital of Japan?",            options:["Osaka","Kyoto","Tokyo","Hiroshima"],            answer:"Tokyo",       category:"geography" },
      { question:"Which continent is the Sahara Desert on?", options:["Asia","Australia","Africa","South America"],   answer:"Africa",      category:"geography" },
      { question:"What is the smallest country in the world?",options:["Monaco","Vatican City","San Marino","Liechtenstein"], answer:"Vatican City", category:"geography" },
      { question:"Which planet is closest to the Sun?",      options:["Earth","Venus","Mercury","Mars"],              answer:"Mercury",     category:"science" },
      { question:"What gas do plants absorb from the air?",  options:["Oxygen","Nitrogen","Carbon Dioxide","Hydrogen"],answer:"Carbon Dioxide", category:"science" },
      { question:"How many bones are in the human body?",    options:["196","206","216","226"],                        answer:"206",         category:"science" },
      { question:"What is the chemical symbol for water?",   options:["WO","H2O","HO2","OW"],                         answer:"H2O",         category:"science" },
      { question:"Which organ pumps blood in the human body?",options:["Liver","Lungs","Kidney","Heart"],             answer:"Heart",       category:"science" },
      { question:"What is the speed of light (approx)?",     options:["300,000 km/s","150,000 km/s","450,000 km/s","100,000 km/s"], answer:"300,000 km/s", category:"science" },
      { question:"What is 7 x 8?",                           options:["54","56","58","64"],                           answer:"56",          category:"math" },
      { question:"What is the square root of 144?",          options:["10","11","12","13"],                           answer:"12",          category:"math" },
      { question:"What is 15% of 200?",                      options:["25","30","35","40"],                           answer:"30",          category:"math" },
      { question:"What is 2 to the power of 10?",            options:["512","1024","2048","256"],                     answer:"1024",        category:"math" },
      { question:"What is the value of Pi (2 decimals)?",    options:["3.14","3.41","3.12","3.16"],                   answer:"3.14",        category:"math" },
      { question:"What is 12 x 12?",                         options:["124","132","144","156"],                       answer:"144",         category:"math" },
      { question:"What does HTML stand for?",                options:["Hyper Text Markup Language","High Tech Machine Language","Hyper Transfer Markup Language","None"], answer:"Hyper Text Markup Language", category:"technology" },
      { question:"What does CSS stand for?",                 options:["Computer Style Sheets","Cascading Style Sheets","Creative Style Syntax","Coded Style Sheets"], answer:"Cascading Style Sheets", category:"technology" },
      { question:"Which language runs in a web browser?",    options:["Python","Java","JavaScript","C++"],            answer:"JavaScript",  category:"technology" },
      { question:"What does CPU stand for?",                 options:["Central Process Unit","Central Processing Unit","Computer Personal Unit","Core Processing Unit"], answer:"Central Processing Unit", category:"technology" },
      { question:"Which company made the iPhone?",           options:["Samsung","Google","Apple","Microsoft"],        answer:"Apple",       category:"technology" },
      { question:"What does RAM stand for?",                 options:["Random Access Memory","Read Access Memory","Run All Memory","Random Array Module"], answer:"Random Access Memory", category:"technology" },
      { question:"How many colors are in a rainbow?",        options:["5","6","7","8"],                               answer:"7",           category:"general" },
      { question:"How many days are in a leap year?",        options:["364","365","366","367"],                       answer:"366",         category:"general" },
      { question:"Which sport uses a shuttlecock?",          options:["Tennis","Badminton","Squash","Volleyball"],    answer:"Badminton",   category:"general" },
      { question:"How many sides does a hexagon have?",      options:["5","6","7","8"],                               answer:"6",           category:"general" },
      { question:"What is the largest ocean on Earth?",      options:["Atlantic","Indian","Arctic","Pacific"],        answer:"Pacific",     category:"general" },
      { question:"In which year did World War II end?",      options:["1943","1944","1945","1946"],                   answer:"1945",        category:"general" },
    ];
    await Question.insertMany(questions);
    res.json({ msg: 'Questions seeded successfully', count: questions.length });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;