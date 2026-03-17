import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GraduationCap, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { login } from '../../utils/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const S = {
  body: { display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', system-ui, sans-serif" },
  left: { width: '42%', background: 'linear-gradient(160deg, #0891b2 0%, #0e7490 60%, #164e63 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '2.5rem', overflow: 'hidden' },
  right: { flex: 1, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', overflowY: 'auto' },
  brand: { color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: 8 },
  heading: { color: '#fff', fontWeight: 800, fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', marginBottom: 12, lineHeight: 1.3 },
  subtitle: { color: 'rgba(255,255,255,.75)', marginBottom: '1.5rem', fontSize: '.95rem', lineHeight: 1.6 },
  featureItem: { color: 'rgba(255,255,255,.9)', display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', fontSize: '.9rem' },
  formWrap: { width: '100%', maxWidth: 420 },
  backLink: { color: '#64748b', textDecoration: 'none', fontSize: '.85rem', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: '1.5rem' },
  label: { display: 'block', fontWeight: 600, fontSize: '.85rem', color: '#1e293b', marginBottom: 6 },
  inputGroup: { display: 'flex', border: '2px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', background: '#f8fafc' },
  inputPrefix: { padding: '10px 12px', color: '#94a3b8', background: '#f1f5f9', borderRight: '1px solid #e2e8f0', display: 'flex', alignItems: 'center' },
  input: { flex: 1, padding: '10px 12px', border: 'none', outline: 'none', fontSize: '.95rem', background: 'transparent', color: '#1e293b' },
  btn: { width: '100%', padding: '12px', background: '#0891b2', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '.95rem', cursor: 'pointer', marginTop: 8 },
  demoHint: { marginTop: '1.5rem', padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '.85rem', color: '#64748b' },
  errorBox: { background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: 8, padding: '10px 14px', fontSize: '.85rem', marginBottom: 12 },
  code: { background: '#e2e8f0', padding: '1px 6px', borderRadius: 4, fontFamily: 'monospace', fontSize: '.8rem', color: '#334155' },
}

const features = [
  'View all student internship assignments',
  'Approve or reject weekly progress reports',
  'Track completion across the entire cohort',
  'Access full report history anytime',
]

export default function TeacherLogin() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login({ username, password, role: 'faculty' })
      if (res.data.status === 'success') {
        signIn(res.data.data)
        toast.success(`Welcome, ${username}!`)
        navigate('/teacher/dashboard')
      } else {
        setError(res.data.message || 'Invalid credentials. Please try again.')
      }
    } catch {
      setError('Unable to connect to server. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={S.body}>
      {/* LEFT PANEL */}
      <motion.div initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5 }}
        style={S.left} className="d-none d-lg-flex flex-column">
        <Link to="/" style={S.brand}><GraduationCap size={26} /> InternTrack</Link>
        <div>
          <h2 style={S.heading}>Monitor, review, and<br />guide your students.</h2>
          <p style={S.subtitle}>A powerful faculty dashboard to oversee internship progress and ensure quality outcomes.</p>
          <div>
            {features.map((f, i) => (
              <div key={i} style={S.featureItem}><CheckCircle size={16} color="#67e8f9" fill="#67e8f9" /> {f}</div>
            ))}
          </div>
        </div>
        <p style={{ color: 'rgba(255,255,255,.4)', fontSize: '.82rem', margin: 0 }}>© 2026 InternTrack</p>
      </motion.div>

      {/* RIGHT PANEL */}
      <motion.div initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5 }}
        style={S.right}>
        <div style={S.formWrap}>
          <Link to="/" style={S.backLink}>← Back to Home</Link>
          <h3 style={{ fontWeight: 800, color: '#1e293b', marginBottom: 4, fontSize: '1.5rem' }}>Faculty Portal 🏫</h3>
          <p style={{ color: '#64748b', marginBottom: 24, fontSize: '.9rem' }}>Sign in to your faculty account</p>

          {error && <div style={S.errorBox}>⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={S.label}>Username</label>
              <div style={S.inputGroup}>
                <span style={S.inputPrefix}>🪪</span>
                <input style={S.input} type="text" placeholder="e.g. teacher1" value={username}
                  onChange={e => setUsername(e.target.value)} required />
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={S.label}>Password</label>
              <div style={S.inputGroup}>
                <span style={S.inputPrefix}>🔒</span>
                <input style={S.input} type={showPwd ? 'text' : 'password'} placeholder="Enter your password"
                  value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  style={{ padding: '10px 12px', background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#94a3b8', borderLeft: '1px solid #e2e8f0' }}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} style={{ ...S.btn, opacity: loading ? .7 : 1 }}>
              {loading ? 'Signing in...' : 'Sign In as Faculty'}
            </button>
          </form>

          <div style={S.demoHint}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <p style={{ fontWeight: 600, margin: 0, color: '#64748b' }}>Demo Credentials</p>
              <button type="button"
                onClick={() => { setUsername('teacher1'); setPassword('teacher123') }}
                style={{ background: '#0891b2', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', fontSize: '.78rem', fontWeight: 700, cursor: 'pointer' }}>
                Fill Demo
              </button>
            </div>
            <p style={{ margin: 0 }}>Username: <code style={S.code}>teacher1</code> &nbsp;|&nbsp; Password: <code style={S.code}>teacher123</code></p>
          </div>

          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '.85rem', marginTop: 20 }}>
            Are you a student? <Link to="/student/login" style={{ color: '#0891b2', fontWeight: 600, textDecoration: 'none' }}>Student Login →</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
