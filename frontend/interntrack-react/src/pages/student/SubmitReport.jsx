import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, FileText, Lightbulb, Clock } from 'lucide-react'
import Navbar from '../../components/Navbar'
import { getStudentDashboard, getStudentProgress, submitReport } from '../../utils/api'
import toast from 'react-hot-toast'

const fmt = (d) => { if (!d) return '–'; try { return new Date(d).toLocaleDateString('en-IN', { year:'numeric', month:'short', day:'numeric' }) } catch { return d } }

const card = { background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,.06)', overflow: 'hidden', marginBottom: 20 }
const cardHeader = { padding: '12px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
const cardBody = { padding: '1.25rem' }
const label = { display: 'block', fontWeight: 600, fontSize: '.85rem', color: '#1e293b', marginBottom: 6 }

const tips = [
  'List the specific tasks you worked on this week.',
  'Mention any new tools, technologies, or concepts you learned.',
  'Describe challenges faced and how you resolved them.',
  'Include collaboration activities or team meetings.',
  'Mention your goals and plan for next week.',
]

export default function SubmitReport() {
  const [internship, setInternship] = useState(null)
  const [recent, setRecent] = useState([])
  const [weekNo, setWeekNo] = useState(1)
  const [reportText, setReportText] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const navLinks = [
    { to: '/student/dashboard', icon: Home,     label: 'Dashboard' },
    { to: '/student/reports',   icon: FileText,  label: 'My Reports' },
  ]

  const loadData = async () => {
    try {
      const [dashRes, progRes] = await Promise.all([getStudentDashboard(), getStudentProgress()])
      if (dashRes.data.status === 'success' && dashRes.data.data.internship) {
        setInternship(dashRes.data.data.internship)
        const total = dashRes.data.data.progress_stats?.total || 0
        setWeekNo(total + 1)
      }
      if (progRes.data.status === 'success') {
        setRecent([...progRes.data.data.progress].reverse().slice(0, 3))
      }
    } catch { toast.error('Failed to load data') }
    finally { setLoading(false) }
  }

  useEffect(() => { loadData() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccess(''); setError('')
    if (reportText.trim().length < 20) { setError('Report must be at least 20 characters.'); return }
    setSubmitting(true)
    try {
      const res = await submitReport({ week_no: parseInt(weekNo), report: reportText.trim() })
      if (res.data.status === 'success') {
        setSuccess(res.data.message)
        setReportText('')
        setWeekNo(w => w + 1)
        toast.success(res.data.message)
        loadData()
      } else {
        setError(res.data.message)
      }
    } catch { setError('Server error. Please try again.') }
    finally { setSubmitting(false) }
  }

  const statusColors = { approved: { bg: '#d1fae5', color: '#065f46' }, pending: { bg: '#fef3c7', color: '#92400e' }, rejected: { bg: '#fee2e2', color: '#991b1b' } }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <Navbar links={navLinks} role="student" />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem' }}>
        {/* BREADCRUMB */}
        <nav style={{ fontSize: '.82rem', color: '#64748b', marginBottom: '1rem' }}>
          <Link to="/" style={{ color: '#4f46e5', textDecoration: 'none' }}>Home</Link>
          <span style={{ margin: '0 6px' }}>›</span>
          <Link to="/student/dashboard" style={{ color: '#4f46e5', textDecoration: 'none' }}>Dashboard</Link>
          <span style={{ margin: '0 6px' }}>›</span>
          Submit Report
        </nav>

        {/* PAGE HEADER */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h4 style={{ fontWeight: 800, color: '#1e293b', margin: '0 0 4px' }}>📝 Submit Weekly Report</h4>
          <p style={{ color: '#64748b', fontSize: '.88rem', margin: 0 }}>Document your internship activities and learnings for the week</p>
        </div>

        {/* INTERNSHIP SUMMARY */}
        {internship && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '12px 20px', marginBottom: 20, display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
            <span style={{ fontSize: '.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>🏢 <strong>{internship.company_name}</strong></span>
            <span style={{ fontSize: '.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>💻 <span>{internship.domain}</span></span>
            <span style={{ fontSize: '.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>📅 <span>{fmt(internship.start_date)} – {fmt(internship.end_date)}</span></span>
            <span style={{ background: internship.status === 'completed' ? '#d1fae5' : '#fef3c7', color: internship.status === 'completed' ? '#065f46' : '#92400e', fontSize: '.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 99, textTransform: 'uppercase' }}>
              {internship.status}
            </span>
          </motion.div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(0,380px)', gap: 20, alignItems: 'start' }}>

          {/* MAIN FORM */}
          <div>
            <div style={card}>
              <div style={cardHeader}>
                <span style={{ fontWeight: 700, fontSize: '.9rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>📋 Weekly Progress Report</span>
              </div>
              <div style={cardBody}>
                <AnimatePresence>
                  {success && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: 8, padding: '10px 14px', fontSize: '.85rem', marginBottom: 12 }}>
                      ✅ {success}
                    </motion.div>
                  )}
                  {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: 8, padding: '10px 14px', fontSize: '.85rem', marginBottom: 12 }}>
                      ⚠️ {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: 20 }}>
                    <label style={label}>Week Number</label>
                    <input type="number" min="1" max="52" value={weekNo} onChange={e => setWeekNo(e.target.value)} required
                      style={{ width: 160, padding: '9px 12px', border: '2px solid #e2e8f0', borderRadius: 8, fontSize: '.9rem', outline: 'none', color: '#1e293b' }}
                      placeholder="e.g. 4" />
                    <p style={{ color: '#94a3b8', fontSize: '.78rem', marginTop: 4 }}>Enter the week number for this report (1–52)</p>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <label style={{ ...label, margin: 0 }}>Weekly Progress</label>
                      <span style={{ fontSize: '.78rem', color: reportText.length >= 20 ? '#059669' : '#94a3b8', fontWeight: 600 }}>{reportText.length} characters</span>
                    </div>
                    <textarea rows={9} value={reportText} onChange={e => setReportText(e.target.value)} required
                      placeholder="Describe your activities, learnings, tasks completed, challenges faced, and plans for next week..."
                      style={{ width: '100%', padding: '10px 14px', border: '2px solid #e2e8f0', borderRadius: 8, fontSize: '.9rem', resize: 'vertical', outline: 'none', color: '#1e293b', lineHeight: 1.6, fontFamily: 'inherit' }} />
                    <p style={{ color: '#94a3b8', fontSize: '.78rem', marginTop: 4 }}>Minimum 20 characters. Be detailed about your work this week.</p>
                  </div>

                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <button type="submit" disabled={submitting}
                      style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 700, fontSize: '.9rem', cursor: 'pointer', opacity: submitting ? .7 : 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                      📤 {submitting ? 'Submitting...' : 'Submit Report'}
                    </button>
                    <Link to="/student/dashboard" style={{ color: '#64748b', textDecoration: 'none', fontSize: '.88rem', fontWeight: 600, border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 20px' }}>Cancel</Link>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div>
            {/* TIPS */}
            <div style={card}>
              <div style={cardHeader}>
                <span style={{ fontWeight: 700, fontSize: '.88rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Lightbulb size={15} color="#d97706" /> Writing Tips
                </span>
              </div>
              <div style={cardBody}>
                {tips.map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#ede9fe', color: '#4f46e5', fontSize: '.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                    <span style={{ color: '#64748b', fontSize: '.82rem', lineHeight: 1.5 }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RECENT SUBMISSIONS */}
            <div style={card}>
              <div style={cardHeader}>
                <span style={{ fontWeight: 700, fontSize: '.88rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={15} color="#64748b" /> Recent Submissions
                </span>
                <Link to="/student/reports" style={{ color: '#4f46e5', fontSize: '.78rem', textDecoration: 'none', fontWeight: 600 }}>View all →</Link>
              </div>
              <div>
                {loading ? (
                  <div style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8', fontSize: '.85rem' }}>Loading...</div>
                ) : recent.length === 0 ? (
                  <div style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8', fontSize: '.85rem' }}>No submissions yet.</div>
                ) : recent.map((r, i) => {
                  const sc = statusColors[r.status] || statusColors.pending
                  return (
                    <div key={i} style={{ padding: '12px 20px', borderBottom: i < recent.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <strong style={{ fontSize: '.82rem', color: '#1e293b' }}>Week {r.week_no}</strong>
                        <span style={{ background: sc.bg, color: sc.color, fontSize: '.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99, textTransform: 'uppercase' }}>{r.status}</span>
                      </div>
                      <p style={{ color: '#64748b', fontSize: '.78rem', margin: '0 0 3px', lineHeight: 1.4 }}>{r.report.substring(0, 90)}{r.report.length > 90 ? '…' : ''}</p>
                      <span style={{ color: '#94a3b8', fontSize: '.74rem' }}>{fmt(r.submitted_at)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

