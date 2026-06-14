import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';

const styles = {
  body: {
    minHeight:'100vh', display:'flex', alignItems:'center',
    justifyContent:'center',
    background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
    fontFamily:"'Segoe UI',sans-serif"
  },
  card: {
    background:'white', padding:'2.5rem', borderRadius:'20px',
    width:'100%', maxWidth:'420px',
    boxShadow:'0 20px 60px rgba(0,0,0,0.3)'
  },
  h1:    { fontSize:'2rem', color:'#4f46e5', marginBottom:'0.3rem', textAlign:'center' },
  sub:   { color:'#6b7280', textAlign:'center', marginBottom:'1.8rem', fontSize:'0.95rem' },
  label: { display:'block', fontSize:'13px', fontWeight:'600', color:'#374151', marginBottom:'5px' },
  input: {
    width:'100%', padding:'0.7rem 1rem', fontSize:'1rem',
    border:'2px solid #e5e7eb', borderRadius:'10px',
    marginBottom:'1rem', outline:'none', boxSizing:'border-box',
    fontFamily:'inherit'
  },
  btn: {
    width:'100%', padding:'0.8rem', fontSize:'1rem', fontWeight:'600',
    background:'#4f46e5', color:'white', border:'none',
    borderRadius:'10px', cursor:'pointer', marginTop:'0.5rem'
  },
  err:  { background:'#fee2e2', color:'#7f1d1d', padding:'10px 14px', borderRadius:'8px', fontSize:'14px', marginBottom:'1rem' },
  link: { textAlign:'center', marginTop:'1.2rem', fontSize:'14px', color:'#6b7280' }
};

export default function Signup() {
  const [form, setForm]       = useState({ name:'', email:'', password:'' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const { data } = await API.post('/auth/signup', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user',  JSON.stringify(data.user));
      nav('/dashboard');
    } catch (e) {
      setError(e.response?.data?.msg || 'Signup failed. Try again.');
    }
    setLoading(false);
  };

  return (
    <div style={styles.body}>
      <div style={styles.card}>
        <h1 style={styles.h1}>🧠 Quiz App</h1>
        <p style={styles.sub}>Create your account</p>
        {error && <div style={styles.err}>{error}</div>}
        <label style={styles.label}>Full Name</label>
        <input style={styles.input} name="name"
          placeholder="Your name" onChange={handle} />
        <label style={styles.label}>Email</label>
        <input style={styles.input} name="email" type="email"
          placeholder="you@example.com" onChange={handle} />
        <label style={styles.label}>Password</label>
        <input style={styles.input} name="password" type="password"
          placeholder="At least 6 characters" onChange={handle}
          onKeyDown={e => e.key === 'Enter' && submit()} />
        <button style={styles.btn} onClick={submit} disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account →'}
        </button>
        <p style={styles.link}>
          Already have an account? <Link to="/" style={{color:'#4f46e5',fontWeight:'600'}}>Login</Link>
        </p>
      </div>
    </div>
  );
}