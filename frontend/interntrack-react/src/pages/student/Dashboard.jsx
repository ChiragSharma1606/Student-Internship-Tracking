import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { PlusCircle, FileText, Award } from 'lucide-react'
import Navbar from '../../components/Navbar'
import { getStudentDashboard } from '../../utils/api'
import toast from 'react-hot-toast'

const fmt = (d) => { if (!d) return '–'; try { return new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) } catch { return d } }

const statStyle = (color) => ({
  card: { background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', borderTop: `4px solid ${color}`, boxShadow: '0 1px 4px rgba(0,0,0,.06)', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 14, transition: 'all .2s' },
  icon: { width: 48, height: 48, borderRadius: 12, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 },
  num:  { fontSize: '2rem', fontWeight: 800, color: '#1e293b', lineHeight: 1 },
  lbl:  { fontSize: '.8rem', color: '#64748b', marginTop: 4, fontWeight: 500 },
})

export default function StudentDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const navLinks = [
    { to: '/student/submit',  icon: PlusCircle, label: 'Submit Report' },
    { to: '/student/reports', icon: FileText,   label: 'My Reports' },
  ]

  useEffect(() => {
    getStudentDashboard()
      .then(res => {
        if (res.data.status === 'success') setData(res.data.data)
        else setError(res.data.message)
      })
      .catch(() => setError('Failed to load dashboard. Is the backend running on port 5000?'))
      .finally(() => setLoading(false))
  }, [])

  const { student, internship, progress_stats: ps, certificate } = data || {}
  const certUrl = certificate && internship ? `/student/certificate/${internship.internship_id}` : null

  // nav links + cert link
  const allNavLinks = certUrl
    ? [...navLinks, { to: certUrl, icon: Award, label: '🏆 My Certificate', gold: true }]
    : navLinks

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#0f172a' }}>
      <Navbar links={navLinks} role="student" certLink={certUrl} />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* PAGE HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h4 style={{ fontWeight: 800, color: '#1e293b', margin: 0 }}>Dashboard</h4>
            <p style={{ color: '#64748b', fontSize: '.88rem', margin: 0 }}>
              {loading ? 'Loading your internship details...' : student ? `Welcome back, ${student.name}!` : 'Loading...'}
            </p>
          </div>
          {data && (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/student/submit" style={{ background: '#4f46e5', color: '#fff', borderRadius: 8, padding: '6px 14px', textDecoration: 'none', fontSize: '.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                <PlusCircle size={14} /> Submit Report
              </Link>
              <Link to="/student/reports" style={{ border: '1px solid #e2e8f0', color: '#475569', borderRadius: 8, padding: '6px 14px', textDecoration: 'none', fontSize: '.82rem', fontWeight: 600 }}>
                View Reports
              </Link>
            </div>
          )}
        </div>

        {/* LOADING */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ width: 40, height: 40, border: '4px solid #e2e8f0', borderTop: '4px solid #4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ color: '#64748b' }}>Loading dashboard data...</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* ERROR */}
        {error && !loading && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: 10, padding: '1rem 1.25rem' }}>
            ⚠️ {error}
          </div>
        )}

        {/* NO PROFILE */}
        {!loading && !error && data && !student && (
          <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', color: '#9a3412', borderRadius: 10, padding: '1rem 1.25rem' }}>
            <strong>Profile not set up yet.</strong> Your account exists but your student profile hasn't been created. Please contact your faculty or administrator.
          </div>
        )}

        {!loading && !error && student && (
          <>
            {/* STATS */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: '1.5rem' }}>
              {[
                { color: '#4f46e5', icon: '📋', num: ps?.total    || 0, lbl: 'Total Reports' },
                { color: '#059669', icon: '✅', num: ps?.approved  || 0, lbl: 'Approved' },
                { color: '#d97706', icon: '⏳', num: ps?.pending   || 0, lbl: 'Pending' },
                { color: '#ef4444', icon: '❌', num: ps?.rejected  || 0, lbl: 'Rejected' },
              ].map((s, i) => {
                const st = statStyle(s.color)
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,.1)' }} style={st.card}>
                    <div style={st.icon}>{s.icon}</div>
                    <div>
                      <div style={st.num}>{s.num}</div>
                      <div style={st.lbl}>{s.lbl}</div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>

            {/* TWO COLUMN */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,5fr) minmax(0,7fr)', gap: 20, marginBottom: '1.25rem' }}>

              {/* PROFILE CARD */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,.06)', overflow: 'hidden' }}>
                <div style={{ padding: '12px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#4f46e5' }}>👤</span>
                  <span style={{ fontWeight: 700, fontSize: '.9rem', color: '#1e293b' }}>Student Profile</span>
                </div>
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: '1.25rem' }}>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', fontWeight: 800, fontSize: '1.3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1e293b' }}>{student.name}</div>
                      <div style={{ color: '#64748b', fontSize: '.82rem' }}>{student.roll_no}</div>
                    </div>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    {[['Department', student.department], ['Year', `Year ${student.year}`], ['Phone', student.phone || '–'], ['Email', student.email || '–']].map(([k, v]) => (
                      <tr key={k} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '7px 0', color: '#94a3b8', fontSize: '.82rem', width: '38%', fontWeight: 500 }}>{k}</td>
                        <td style={{ padding: '7px 0', color: '#1e293b', fontSize: '.82rem', fontWeight: 600 }}>{v}</td>
                      </tr>
                    ))}
                  </table>
                </div>
              </motion.div>

              {/* INTERNSHIP CARD */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
                style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,.06)', overflow: 'hidden' }}>
                <div style={{ padding: '12px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#4f46e5' }}>🏢</span>
                    <span style={{ fontWeight: 700, fontSize: '.9rem', color: '#1e293b' }}>Internship Details</span>
                  </div>
                  {internship && (
                    <span style={{ background: internship.status === 'completed' ? '#d1fae5' : '#fef3c7', color: internship.status === 'completed' ? '#065f46' : '#92400e', fontSize: '.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 99, textTransform: 'uppercase' }}>
                      {internship.status}
                    </span>
                  )}
                </div>
                <div style={{ padding: '1.25rem' }}>
                  {!internship ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>📭</div>
                      <p style={{ margin: 0, fontSize: '.88rem' }}>No internship assigned yet. Please contact your faculty.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                      {[['Company', internship.company_name, true], ['Domain', internship.domain, false], ['Start Date', fmt(internship.start_date), false], ['End Date', fmt(internship.end_date), false], ['Contact', internship.contact_person || '–', false], ['Address', internship.address || '–', false]].map(([k, v, bold], idx, arr) => (
                        <div key={k} style={{ display: 'flex', padding: '8px 0', borderBottom: idx < arr.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                          <span style={{ color: '#94a3b8', fontSize: '.82rem', minWidth: 110, fontWeight: 500 }}>{k}</span>
                          <span style={{ color: '#1e293b', fontSize: '.82rem', fontWeight: bold ? 700 : 600 }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* CERTIFICATE BANNER */}
            <AnimatePresence>
              {certificate && internship && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid #86efac', borderRadius: 12, padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #fef3c7, #fde68a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0, boxShadow: '0 4px 16px rgba(251,191,36,.3)' }}>🏆</div>
                  <div style={{ flex: 1 }}>
                    <h5 style={{ fontWeight: 800, color: '#166534', margin: '0 0 4px' }}>🎉 Internship Completed!</h5>
                    <p style={{ color: '#15803d', fontSize: '.88rem', margin: '0 0 4px' }}>Congratulations! Your internship has been successfully completed and a certificate has been issued.</p>
                    <span style={{ color: '#64748b', fontSize: '.82rem' }}>
                      📅 Issued on: <strong>{fmt(certificate.issue_date)}</strong> &nbsp;|&nbsp; Cert ID: <strong>CERT-{String(certificate.certificate_id).padStart(4,'0')}</strong>
                    </span>
                  </div>
                  <Link to={certUrl} style={{ background: '#16a34a', color: '#fff', padding: '10px 20px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: '.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                    🏅 View Certificate
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  )
}
