import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const LABELS     = ['A','B','C','D'];
const TIME_LIMIT = 15;
const CATS = [
  { id:'all',        icon:'🌍', label:'All Topics' },
  { id:'science',    icon:'🔬', label:'Science' },
  { id:'geography',  icon:'🗺️', label:'Geography' },
  { id:'math',       icon:'🔢', label:'Math' },
  { id:'technology', icon:'💻', label:'Technology' },
  { id:'general',    icon:'🎯', label:'General' },
];

const s = {
  body:      { minHeight:'100vh', background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)', fontFamily:"'Segoe UI',sans-serif", display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' },
  card:      { background:'white', padding:'2.5rem', borderRadius:'20px', width:'100%', maxWidth:'560px', boxShadow:'0 20px 60px rgba(0,0,0,0.3)' },
  h2:        { fontSize:'1.5rem', fontWeight:'700', color:'#4f46e5', marginBottom:'0.3rem', textAlign:'center' },
  sub:       { color:'#6b7280', textAlign:'center', marginBottom:'1.5rem', fontSize:'14px' },
  catGrid:   { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px', marginBottom:'1.5rem' },
  btn:       { width:'100%', padding:'0.8rem', fontSize:'1rem', fontWeight:'700', background:'#4f46e5', color:'white', border:'none', borderRadius:'10px', cursor:'pointer', fontFamily:'inherit' },
  btnBack:   { width:'100%', padding:'0.7rem', fontSize:'0.95rem', fontWeight:'600', background:'white', color:'#4f46e5', border:'2px solid #4f46e5', borderRadius:'10px', cursor:'pointer', marginTop:'0.7rem', fontFamily:'inherit' },
  progressRow: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'5px' },
  pText:     { fontSize:'13px', color:'#6b7280', fontWeight:'500' },
  catTag:    { fontSize:'11px', fontWeight:'700', padding:'2px 10px', borderRadius:'99px', background:'#eef2ff', color:'#4f46e5' },
  barWrap:   { background:'#e5e7eb', borderRadius:'99px', height:'7px', marginBottom:'12px' },
  timerRow:  { display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' },
  timerBarW: { flex:1, background:'#e5e7eb', borderRadius:'99px', height:'9px' },
  qText:     { fontSize:'1.1rem', fontWeight:'600', color:'#1f2937', lineHeight:'1.6', marginBottom:'1.2rem' },
  // Result
  resEmoji:  { fontSize:'3.5rem', textAlign:'center', marginBottom:'0.5rem' },
  resName:   { fontSize:'1.3rem', fontWeight:'700', textAlign:'center', color:'#1f2937', marginBottom:'1.2rem' },
  scoreGrid: { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px', marginBottom:'1.2rem' },
  scoreCard: { background:'#f3f4f6', borderRadius:'12px', padding:'0.9rem 0.5rem', textAlign:'center' },
  scLabel:   { fontSize:'11px', color:'#6b7280', marginBottom:'4px' },
  scValue:   { fontSize:'1.5rem', fontWeight:'700', color:'#4f46e5' },
  // Review
  reviewWrap:  { marginTop:'1.2rem', marginBottom:'1.2rem' },
  reviewTitle: { fontSize:'15px', fontWeight:'700', color:'#374151', marginBottom:'10px', textAlign:'left' },
  reviewItem:  { border:'1px solid #e5e7eb', borderRadius:'12px', padding:'12px 14px', marginBottom:'8px', textAlign:'left' },
  reviewQ:     { fontSize:'13px', fontWeight:'600', color:'#374151', marginBottom:'6px' },
  reviewCorrect: { fontSize:'13px', color:'#065f46', background:'#d1fae5', padding:'4px 10px', borderRadius:'6px', display:'inline-block', marginBottom:'3px' },
  reviewWrong:   { fontSize:'13px', color:'#7f1d1d', background:'#fee2e2', padding:'4px 10px', borderRadius:'6px', display:'inline-block', marginBottom:'3px' },
  reviewAnswer:  { fontSize:'13px', color:'#065f46', background:'#d1fae5', padding:'4px 10px', borderRadius:'6px', display:'inline-block', marginLeft:'6px' },
  reviewTimeout: { fontSize:'13px', color:'#78350f', background:'#fef3c7', padding:'4px 10px', borderRadius:'6px', display:'inline-block', marginBottom:'3px' },
};

function shuffle(arr) {
  const a = [...arr];
  for (let i=a.length-1; i>0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

export default function Quiz() {
  const [screen, setScreen]         = useState('select');
  const [cat, setCat]               = useState('all');
  const [questions, setQuestions]   = useState([]);
  const [idx, setIdx]               = useState(0);
  const [score, setScore]           = useState(0);
  const [chosen, setChosen]         = useState(null);
  const [feedback, setFeedback]     = useState({ text:'', type:'' });
  const [timeLeft, setTimeLeft]     = useState(TIME_LIMIT);
  const [timerColor, setTimerColor] = useState('#4f46e5');
  const [shuffledOpts, setShuffledOpts] = useState([]);
  const [saving, setSaving]         = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const timerRef = useRef(null);
  const nav = useNavigate();

  const loadQuestions = async () => {
    try {
      const { data } = await API.get('/questions?category=' + cat + '&limit=10');
      if (data.length === 0) { alert('No questions found!'); return; }
      setQuestions(data);
      setIdx(0); setScore(0); setChosen(null);
      setUserAnswers([]);
      setFeedback({ text:'', type:'' });
      setScreen('quiz');
    } catch (e) {
      alert('Failed to load questions. Make sure backend is running.');
    }
  };

  useEffect(() => {
    if (screen !== 'quiz' || questions.length === 0) return;
    setShuffledOpts(shuffle(questions[idx].options));
    setChosen(null);
    setFeedback({ text:'', type:'' });
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [idx, screen, questions]);

  const startTimer = () => {
    clearInterval(timerRef.current);
    setTimeLeft(TIME_LIMIT);
    setTimerColor('#4f46e5');
    let t = TIME_LIMIT;
    timerRef.current = setInterval(() => {
      t--;
      setTimeLeft(t);
      if (t / TIME_LIMIT < 0.4) setTimerColor('#ef4444');
      if (t <= 0) { clearInterval(timerRef.current); handleTimeout(); }
    }, 1000);
  };

  const handleTimeout = () => {
    if (chosen) return;
    const correct = questions[idx].answer;
    setChosen('__timeout__');
    setFeedback({ text:"⏱ Time's up! Correct: " + correct, type:'timeout' });
    setUserAnswers(prev => [...prev, {
      question: questions[idx].question,
      chosen:   'No answer (timeout)',
      correct:  correct,
      right:    false,
      timeout:  true
    }]);
  };

  const selectAnswer = (opt) => {
    if (chosen) return;
    clearInterval(timerRef.current);
    setChosen(opt);
    const correct = questions[idx].answer;
    const isRight = opt === correct;
    if (isRight) {
      setScore(s => s + 1);
      setFeedback({ text:'✓ Correct!', type:'correct' });
    } else {
      setFeedback({ text:'✗ Wrong! Correct: ' + correct, type:'wrong' });
    }
    setUserAnswers(prev => [...prev, {
      question: questions[idx].question,
      chosen:   opt,
      correct:  correct,
      right:    isRight,
      timeout:  false
    }]);
  };

  const next = async () => {
    if (!chosen) { alert('Please select an answer!'); return; }
    if (idx + 1 < questions.length) {
      setIdx(i => i + 1);
    } else {
      setSaving(true);
      try {
        await API.post('/scores', { score, total: questions.length, category: cat });
      } catch (e) { console.error('Score save failed', e); }
      setSaving(false);
      setScreen('result');
    }
  };

  const getOptState = (opt) => {
    if (!chosen) return '';
    if (opt === questions[idx].answer) return 'correct';
    if (opt === chosen) return 'wrong';
    return '';
  };

  const optBtn = (state) => ({
    display:'flex', alignItems:'center', gap:'12px', width:'100%',
    marginBottom:'0.6rem', padding:'0.75rem 1rem',
    background: state==='correct'?'#d1fae5':state==='wrong'?'#fee2e2':'#f9fafb',
    color: state==='correct'?'#065f46':state==='wrong'?'#7f1d1d':'#1f2937',
    border:'2px solid '+(state==='correct'?'#10b981':state==='wrong'?'#ef4444':'#e5e7eb'),
    borderRadius:'10px', textAlign:'left', cursor:state?'default':'pointer',
    fontSize:'0.95rem', fontFamily:'inherit', transition:'all 0.15s'
  });

  const optLabel = (state) => ({
    width:'28px', height:'28px', borderRadius:'50%', flexShrink:0,
    background: state==='correct'?'#10b981':state==='wrong'?'#ef4444':'#e5e7eb',
    color: state==='correct'||state==='wrong'?'white':'#374151',
    fontWeight:'700', fontSize:'12px',
    display:'flex', alignItems:'center', justifyContent:'center'
  });

  const catBtn = (sel) => ({
    padding:'0.7rem 0.5rem',
    border: sel?'2px solid #4f46e5':'2px solid #e5e7eb',
    borderRadius:'10px',
    background: sel?'#4f46e5':'#f9fafb',
    cursor:'pointer', fontSize:'13px',
    fontWeight: sel?'700':'400',
    color: sel?'white':'#374151',
    textAlign:'center', fontFamily:'inherit'
  });

  // ── Select screen ──
  if (screen === 'select') return (
    <div style={s.body}>
      <div style={s.card}>
        <h2 style={s.h2}>🧠 New Quiz</h2>
        <p style={s.sub}>Pick a category to begin</p>
        <div style={s.catGrid}>
          {CATS.map(c => (
            <button key={c.id} style={catBtn(cat===c.id)} onClick={() => setCat(c.id)}>
              <span style={{display:'block', fontSize:'1.3rem', marginBottom:'4px'}}>{c.icon}</span>
              {c.label}
            </button>
          ))}
        </div>
        <button style={s.btn} onClick={loadQuestions}>Start Quiz →</button>
        <button style={s.btnBack} onClick={() => nav('/dashboard')}>← Back to Dashboard</button>
      </div>
    </div>
  );

  // ── Result screen ──
  if (screen === 'result') {
    const total = questions.length;
    const pct   = Math.round((score / total) * 100);
    const emoji = pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪';
    const msg   = pct >= 80 ? 'Excellent work!' : pct >= 50 ? 'Good job!' : 'Keep practicing!';
    return (
      <div style={s.body}>
        <div style={{...s.card, maxHeight:'90vh', overflowY:'auto'}}>

          {/* Score summary */}
          <div style={s.resEmoji}>{emoji}</div>
          <p style={s.resName}>{msg}</p>
          <div style={s.scoreGrid}>
            <div style={s.scoreCard}><div style={s.scLabel}>Score</div><div style={s.scValue}>{score}/{total}</div></div>
            <div style={s.scoreCard}><div style={s.scLabel}>Percentage</div><div style={s.scValue}>{pct}%</div></div>
            <div style={s.scoreCard}><div style={s.scLabel}>Correct</div><div style={s.scValue}>{score} ✓</div></div>
          </div>

          {saving && <p style={{textAlign:'center',color:'#6b7280',fontSize:'13px',marginBottom:'1rem'}}>Saving score...</p>}

          {/* ── Answer Review ── */}
          <div style={s.reviewWrap}>
            <p style={s.reviewTitle}>📋 Answer Review</p>
            {userAnswers.map((a, i) => (
              <div key={i} style={{
                ...s.reviewItem,
                borderLeft: '4px solid ' + (a.right ? '#10b981' : '#ef4444')
              }}>
                {/* Question */}
                <p style={s.reviewQ}>{i+1}. {a.question}</p>

                {/* What user answered */}
                {a.timeout ? (
                  <span style={s.reviewTimeout}>⏱ No answer — timed out</span>
                ) : a.right ? (
                  <span style={s.reviewCorrect}>✓ Your answer: {a.chosen}</span>
                ) : (
                  <span style={s.reviewWrong}>✗ Your answer: {a.chosen}</span>
                )}

                {/* Show correct answer if wrong or timeout */}
                {!a.right && (
                  <div style={{marginTop:'4px'}}>
                    <span style={s.reviewAnswer}>✓ Correct: {a.correct}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button style={s.btn} onClick={() => { setUserAnswers([]); setScreen('select'); }}>Play Again 🔄</button>
          <button style={s.btnBack} onClick={() => nav('/dashboard')}>View Dashboard</button>
        </div>
      </div>
    );
  }

  // ── Quiz screen ──
  const q       = questions[idx];
  const total   = questions.length;
  const catInfo = CATS.find(c => c.id === cat);

  return (
    <div style={s.body}>
      <div style={s.card}>
        <div style={s.progressRow}>
          <span style={s.pText}>Question {idx+1} of {total}</span>
          <span style={s.catTag}>{catInfo?.icon} {catInfo?.label}</span>
        </div>
        <div style={s.barWrap}>
          <div style={{ height:'7px', background:'#10b981', borderRadius:'99px', width:((idx/total)*100)+'%', transition:'width 0.4s' }} />
        </div>
        <div style={s.timerRow}>
          <div style={s.timerBarW}>
            <div style={{ height:'9px', background:timerColor, borderRadius:'99px', width:((timeLeft/TIME_LIMIT)*100)+'%', transition:'width 0.9s linear' }} />
          </div>
          <span style={{ fontSize:'13px', fontWeight:'700', color:timerColor, minWidth:'36px', textAlign:'right' }}>{timeLeft}s</span>
        </div>

        <p style={s.qText}>{idx+1}. {q.question}</p>

        {shuffledOpts.map((opt, i) => {
          const state = getOptState(opt);
          return (
            <button key={opt} style={optBtn(state)} onClick={() => selectAnswer(opt)} disabled={!!chosen}>
              <span style={optLabel(state)}>{LABELS[i]}</span>
              <span>{opt}</span>
            </button>
          );
        })}

        <div style={{
          fontSize:'14px', fontWeight:'600', padding:'8px 12px',
          borderRadius:'8px', marginBottom:'10px',
          display: feedback.type ? 'block' : 'none',
          background: feedback.type==='correct'?'#d1fae5':feedback.type==='wrong'?'#fee2e2':'#fef3c7',
          color: feedback.type==='correct'?'#065f46':feedback.type==='wrong'?'#7f1d1d':'#78350f'
        }}>{feedback.text}</div>

        <button style={s.btn} onClick={next}>
          {idx === total-1 ? 'Finish ✓' : 'Next →'}
        </button>
      </div>
    </div>
  );
}