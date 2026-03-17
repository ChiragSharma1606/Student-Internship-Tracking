import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, PlusCircle } from 'lucide-react'
import Navbar from '../../components/Navbar'
import { getStudentProgress } from '../../utils/api'

const fmt = (d) => { if (!d) return '–'; try { return new Date(d).toLocaleDateString('en-IN', { year:'numeric', month:'short', day:'numeric' }) } catch { return d } }

const STATUS_COLORS = {
  approved: { bg: '#d1fae5', color: '#065f46', border: '#4px solid #10b981' },
  pending:  { bg: '#fef3c7', color: '#92400e', border: '4px solid #f59e0b' },
  rejected: { bg: '#fee2e2', color: '#991b1b', border: '4px solid #ef4444' },
}

const BORDER_COLORS = { approved: '#10b981', pending: '#f59e0b', rejected: '#ef4444' }

export default function MyReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const navLinks = [
    { to: '/student/dashboard', icon: Home,       label: 'Dashboard' },
    { to: '/student/submit',    icon: PlusCircle,  label: 'Submit Report' },
  ]

  useEffect(() => {
    getStudentProgress()
      .then(res => { if (res.data.status === 'success') setReports(res.data.data.progress) })
      .finally(() => setLoading(false))
  }, [])

  const counts = {
    all:      reports.length,
    pending:  reports.filter(r => r.status === 'pending').length,
    approved: reports.filter(r => r.status === 'approved').length,
    rejected: reports.filter(r => r.status === 'rejected').length,
  }

  const filtered = filter === 'all' ? reports : reports.filter(r => r.status === filter)

  const tabs = [
    { key: 'all',      label: 'All',      color: '#4f46e5', bg: '#ede9fe' },
    { key: 'pending',  label: '⏳ Pending',  color: '#92400e', bg: '#fef3c7' },
    { key: 'approved', label: '✅ Approved', color: '#065f46', bg: '#d1fae5' },
    { key: 'rejected', label: '❌ Rejected', color: '#991b1b', bg: '#fee2e2' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <Navbar links={navLinks} role="student" />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem' }}>
        <nav style={{ fontSize: '.82rem', color: '#64748b', marginBottom: '1rem' }}>
          <Link to="/" style={{ color: '#4f46e5', textDecoration: 'none' }}>Home</Link>
          <span style={{ margin: '0 6px' }}>›</span>
          <Link to="/student/dashboard" style={{ color: '#4f46e5', textDecoration: 'none' }}>Dashboard</Link>
          <span style={{ margin: '0 6px' }}>›</span>
          My Reports
        </nav>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h4 style={{ fontWeight: 800, color: '#1e293b', margin: '0 0 2px' }}>📋 My Progress Reports</h4>
            <p style={{ color: '#64748b', fontSize: '.88rem', margin: 0 }}>View the status of your submitted weekly reports</p>
          </div>
          <span style={{ background: '#ede9fe', color: '#4f46e5', borderRadius: 99, padding: '4px 14px', fontSize: '.85rem', fontWeight: 700 }}>
            {filtered.length} reports
          </span>
        </div>

        {/* FILTER TABS */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
          <span style={{ fontSize: '.82rem', color: '#64748b', fontWeight: 600, marginRight: 4 }}>Filter:</span>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setFilter(t.key)}
              style={{ border: 'none', cursor: 'pointer', borderRadius: 99, padding: '5px 14px', fontSize: '.82rem', fontWeight: 700,
                       background: filter === t.key ? t.bg : '#f1f5f9', color: filter === t.key ? t.color : '#64748b',
                       transition: 'all .15s', display: 'flex', alignItems: 'center', gap: 6 }}>
              {t.label}
              <span style={{ background: filter === t.key ? 'rgba(0,0,0,.12)' : '#e2e8f0', borderRadius: 99, padding: '1px 7px', fontSize: '.72rem', fontWeight: 800 }}>{counts[t.key]}</span>
            </button>
          ))}
        </div>

        {/* LOADING */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
            <div style={{ width: 36, height: 36, border: '4px solid #e2e8f0', borderTop: '4px solid #4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            Loading reports...
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>📭</div>
            <h5 style={{ fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>No Reports Found</h5>
            <p style={{ color: '#64748b', fontSize: '.88rem', marginBottom: 20 }}>
              {filter === 'all' ? 'No reports submitted yet.' : `No ${filter} reports found.`}
            </p>
            <Link to="/student/submit" style={{ background: '#4f46e5', color: '#fff', padding: '9px 22px', borderRadius: 9, textDecoration: 'none', fontWeight: 700, fontSize: '.88rem' }}>
              + Submit Your First Report
            </Link>
          </div>
        )}

        {/* REPORT CARDS */}
        <AnimatePresence>
          {!loading && filtered.map((r, i) => {
            const sc = STATUS_COLORS[r.status] || STATUS_COLORS.pending
            const bc = BORDER_COLORS[r.status] || BORDER_COLORS.pending
            return (
              <motion.div key={r.progress_id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }} transition={{ delay: i * 0.05 }}
                style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', borderLeft: `4px solid ${bc}`, marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,.06)', overflow: 'hidden' }}>
                {/* Card header */}
                <div style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ background: '#4f46e5', color: '#fff', borderRadius: 99, padding: '3px 12px', fontSize: '.78rem', fontWeight: 700 }}>Week {r.week_no}</span>
                    <span style={{ color: '#64748b', fontSize: '.8rem' }}>📅 {fmt(r.submitted_at)}</span>
                  </div>
                  <span style={{ background: sc.bg, color: sc.color, borderRadius: 99, padding: '3px 12px', fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase' }}>{r.status}</span>
                </div>
                {/* Card body */}
                <div style={{ padding: '1rem 1.25rem' }}>
                  <p style={{ color: '#334155', fontSize: '.9rem', lineHeight: 1.7, margin: 0 }}>{r.report}</p>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}

