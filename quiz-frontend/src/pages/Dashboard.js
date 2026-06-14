import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const s = {
  body:     { minHeight:'100vh', background:'#f3f4f6', fontFamily:"'Segoe UI',sans-serif" },
  nav:      { background:'#4f46e5', padding:'1rem 2rem', display:'flex', justifyContent:'space-between', alignItems:'center' },
  navTitle: { color:'white', fontSize:'1.3rem', fontWeight:'700' },
  navBtn:   { background:'white', color:'#4f46e5', border:'none', borderRadius:'8px', padding:'6px 16px', cursor:'pointer', fontWeight:'600', fontSize:'14px' },
  wrap:     { maxWidth:'700px', margin:'2rem auto', padding:'0 1rem' },
  hello:    { fontSize:'1.5rem', fontWeight:'700', color:'#1f2937', marginBottom:'0.3rem' },
  sub:      { color:'#6b7280', marginBottom:'1.5rem', fontSize:'14px' },
  grid:     { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px', marginBottom:'1.5rem' },
  card:     { background:'white', borderRadius:'14px', padding:'1.2rem', boxShadow:'0 2px 8px rgba(0,0,0,0.07)', textAlign:'center' },
  cLabel:   { fontSize:'12px', color:'#6b7280', marginBottom:'6px' },
  cValue:   { fontSize:'2rem', fontWeight:'700', color:'#4f46e5' },
  startBtn: { width:'100%', padding:'1rem', fontSize:'1.1rem', fontWeight:'700', background:'#4f46e5', color:'white', border:'none', borderRadius:'14px', cursor:'pointer', marginBottom:'1.5rem' },
  section:  { background:'white', borderRadius:'14px', padding:'1.5rem', boxShadow:'0 2px 8px rgba(0,0,0,0.07)' },
  secTitle: { fontSize:'1rem', fontWeight:'700', color:'#374151', marginBottom:'1rem' },
  row:      { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #f3f4f6' },
  empty:    { textAlign:'center', color:'#9ca3af', padding:'2rem 0', fontSize:'14px' }
};

export default function Dashboard() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const nav  = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    API.get('/scores/me')
      .then(r => { setStats(r.data); setLoading(false); })
      .catch(() => logout());
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    nav('/');
  };

  if (loading) return (
    <div style={{...s.body, display:'flex', alignItems:'center', justifyContent:'center'}}>
      <p style={{color:'#6b7280', fontSize:'1.1rem'}}>Loading dashboard...</p>
    </div>
  );

  return (
    <div style={s.body}>
      <div style={s.nav}>
        <span style={s.navTitle}>🧠 Quiz App</span>
        <button style={s.navBtn} onClick={logout}>Logout</button>
      </div>
      <div style={s.wrap}>
        <p style={s.hello}>Hello, {user.name} 👋</p>
        <p style={s.sub}>Here is your quiz performance summary</p>
        <div style={s.grid}>
          <div style={s.card}><div style={s.cLabel}>Highest Score</div><div style={s.cValue}>{stats.best}</div></div>
          <div style={s.card}><div style={s.cLabel}>Quizzes Taken</div><div style={s.cValue}>{stats.total}</div></div>
          <div style={s.card}><div style={s.cLabel}>Average Score</div><div style={s.cValue}>{stats.avg}</div></div>
        </div>
        <button style={s.startBtn} onClick={() => nav('/quiz')}>Start New Quiz →</button>
        <div style={s.section}>
          <p style={s.secTitle}>Recent Quiz History</p>
          {stats.scores.length === 0
            ? <p style={s.empty}>No quizzes yet. Start your first quiz!</p>
            : stats.scores.map((sc, i) => {
                const pct = Math.round((sc.score / sc.total) * 100);
                return (
                  <div key={i} style={s.row}>
                    <div style={{fontSize:'14px', color:'#374151'}}>
                      {new Date(sc.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                      {' — '}<span style={{color:'#6b7280', textTransform:'capitalize'}}>{sc.category}</span>
                    </div>
                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                      <span style={{fontWeight:'700'}}>{sc.score}/{sc.total}</span>
                      <span style={{
                        padding:'3px 10px', borderRadius:'99px', fontSize:'12px', fontWeight:'700',
                        background: pct>=80?'#d1fae5':pct>=50?'#fef3c7':'#fee2e2',
                        color: pct>=80?'#065f46':pct>=50?'#78350f':'#7f1d1d'
                      }}>{pct}%</span>
                    </div>
                  </div>
                );
              })
          }
        </div>
      </div>
    </div>
  );
}