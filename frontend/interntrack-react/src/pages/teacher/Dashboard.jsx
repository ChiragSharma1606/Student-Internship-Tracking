import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ClipboardCheck } from 'lucide-react'
import Navbar from '../../components/Navbar'
import { getTeacherDashboard, getAllCertificates, markCompleted, generateCertificate } from '../../utils/api'
import toast from 'react-hot-toast'

const fmt = (d) => { if (!d) return '–'; try { return new Date(d).toLocaleDateString('en-IN', { year:'numeric', month:'short', day:'numeric' }) } catch { return d } }

const statCard = (color) => ({
  card: { background:'#fff', borderRadius:12, border:'1px solid #e2e8f0', borderTop:`4px solid ${color}`, boxShadow:'0 1px 4px rgba(0,0,0,.06)', padding:'1rem 1.25rem', display:'flex', alignItems:'center', gap:14 },
  icon: { width:48, height:48, borderRadius:12, background:color+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', flexShrink:0 },
})

const STATS = [
  { color:'#4f46e5', icon:'👥', key:'total_students',   lbl:'Total Students' },
  { color:'#0891b2', icon:'💼', key:'ongoing',           lbl:'Ongoing' },
  { color:'#059669', icon:'✅', key:'completed',          lbl:'Completed' },
  { color:'#d97706', icon:'⏳', key:'pending_reports',   lbl:'Pending Review' },
  { color:'#059669', icon:'👍', key:'approved_reports',  lbl:'Approved Reports' },
  { color:'#ef4444', icon:'👎', key:'rejected_reports',  lbl:'Rejected Reports' },
]

export default function TeacherDashboard() {
  const [stats, setStats]         = useState({})
  const [internships, setInternships] = useState([])
  const [certs, setCerts]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [rowStates, setRowStates] = useState({}) // {id: 'marking'|'issuing'|'done'}

  const navLinks = [{ to:'/teacher/reports', icon:ClipboardCheck, label:'Review Reports' }]

  const load = async () => {
    try {
      const [dashRes, certRes] = await Promise.all([getTeacherDashboard(), getAllCertificates()])
      if (dashRes.data.status === 'success') {
        setStats(dashRes.data.data.stats)
        setInternships(dashRes.data.data.internships)
      }
      if (certRes.data.status === 'success') setCerts(certRes.data.data.certificates)
    } catch { toast.error('Failed to load dashboard') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleMarkDone = async (id) => {
    setRowStates(s => ({ ...s, [id]: 'marking' }))
    try {
      const res = await markCompleted({ internship_id: id })
      if (res.data.status === 'success') {
        setInternships(prev => prev.map(i => i.internship_id === id ? { ...i, status: 'completed' } : i))
        setRowStates(s => ({ ...s, [id]: 'ready_cert' }))
        toast.success('Internship marked as completed!')
      } else { toast.error(res.data.message); setRowStates(s => ({ ...s, [id]: null })) }
    } catch { toast.error('Server error'); setRowStates(s => ({ ...s, [id]: null })) }
  }

  const handleIssueCert = async (id) => {
    setRowStates(s => ({ ...s, [id]: 'issuing' }))
    try {
      const res = await generateCertificate({ internship_id: id })
      if (res.data.status === 'success') {
        setRowStates(s => ({ ...s, [id]: 'cert_issued' }))
        toast.success(res.data.message)
        const certRes = await getAllCertificates()
        if (certRes.data.status === 'success') setCerts(certRes.data.data.certificates)
      } else { toast.error(res.data.message); setRowStates(s => ({ ...s, [id]: 'ready_cert' })) }
    } catch { toast.error('Server error'); setRowStates(s => ({ ...s, [id]: 'ready_cert' })) }
  }

  const certIssued = (id) => certs.find(c => c.internship_id === id)

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:"'Segoe UI', system-ui, sans-serif", color:'#0f172a' }}>
      <Navbar links={navLinks} role="faculty" />

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'2rem 1.5rem' }}>
        {/* HEADER */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem', flexWrap:'wrap', gap:10 }}>
          <div>
            <h4 style={{ fontWeight:800, color:'#1e293b', margin:'0 0 2px' }}>Faculty Dashboard</h4>
            <p style={{ color:'#64748b', fontSize:'.88rem', margin:0 }}>Monitor student internships and manage progress reports</p>
          </div>
          <Link to="/teacher/reports" style={{ background:'#4f46e5', color:'#fff', borderRadius:8, padding:'7px 16px', textDecoration:'none', fontSize:'.82rem', fontWeight:700, display:'flex', alignItems:'center', gap:5 }}>
            <ClipboardCheck size={14} /> Review Reports
          </Link>
        </div>

        {/* LOADING */}
        {loading && (
          <div style={{ textAlign:'center', padding:'4rem' }}>
            <div style={{ width:36, height:36, border:'4px solid #e2e8f0', borderTop:'4px solid #4f46e5', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto 12px' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <p style={{ color:'#64748b' }}>Loading dashboard data...</p>
          </div>
        )}

        {!loading && (
          <>
            {/* STATS ROW 1 */}
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
              style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:14, marginBottom:14 }}>
              {STATS.slice(0,3).map((s,i) => {
                const st = statCard(s.color)
                return (
                  <motion.div key={i} whileHover={{ y:-3, boxShadow:'0 8px 24px rgba(0,0,0,.1)' }} style={st.card} transition={{ duration:.15 }}>
                    <div style={st.icon}>{s.icon}</div>
                    <div>
                      <div style={{ fontSize:'2rem', fontWeight:800, color:'#1e293b', lineHeight:1 }}>{stats[s.key] ?? 0}</div>
                      <div style={{ fontSize:'.8rem', color:'#64748b', marginTop:4, fontWeight:500 }}>{s.lbl}</div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>

            {/* STATS ROW 2 */}
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.1 }}
              style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:14, marginBottom:'1.5rem' }}>
              {STATS.slice(3).map((s,i) => {
                const st = statCard(s.color)
                return (
                  <motion.div key={i} whileHover={{ y:-3, boxShadow:'0 8px 24px rgba(0,0,0,.1)' }} style={st.card} transition={{ duration:.15 }}>
                    <div style={st.icon}>{s.icon}</div>
                    <div>
                      <div style={{ fontSize:'2rem', fontWeight:800, color:'#1e293b', lineHeight:1 }}>{stats[s.key] ?? 0}</div>
                      <div style={{ fontSize:'.8rem', color:'#64748b', marginTop:4, fontWeight:500 }}>{s.lbl}</div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>

            {/* INTERNSHIPS TABLE */}
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.2 }}
              style={{ background:'#fff', borderRadius:12, border:'1px solid #e2e8f0', boxShadow:'0 1px 4px rgba(0,0,0,.06)', marginBottom:20, overflow:'hidden' }}>
              <div style={{ padding:'12px 20px', borderBottom:'1px solid #e2e8f0', background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{ fontWeight:700, fontSize:'.9rem', color:'#1e293b', display:'flex', alignItems:'center', gap:8 }}>📋 All Student Internships</span>
                <div style={{ display:'flex', gap:8 }}>
                  <Link to="/teacher/reports" style={{ background:'#4f46e5', color:'#fff', borderRadius:7, padding:'5px 13px', textDecoration:'none', fontSize:'.78rem', fontWeight:700 }}>Review Reports</Link>
                </div>
              </div>
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'.82rem' }}>
                  <thead>
                    <tr style={{ background:'#f8fafc' }}>
                      {['#','Student','Roll No','Department','Company','Domain','Start','End','Status','Actions'].map(h => (
                        <th key={h} style={{ padding:'10px 14px', textAlign:'left', color:'#64748b', fontWeight:700, fontSize:'.78rem', whiteSpace:'nowrap', borderBottom:'1px solid #e2e8f0' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {internships.length === 0 ? (
                      <tr><td colSpan={10} style={{ textAlign:'center', padding:'2rem', color:'#94a3b8' }}>No internships found.</td></tr>
                    ) : internships.map((intern, idx) => {
                      const isCompleted = intern.status === 'completed'
                      const cert = certIssued(intern.internship_id)
                      const rs = rowStates[intern.internship_id]

                      let actionBtn
                      if (cert || rs === 'cert_issued') {
                        actionBtn = <Link to={`/student/certificate/${intern.internship_id}`}
                          style={{ background:'#059669', color:'#fff', borderRadius:7, padding:'5px 12px', textDecoration:'none', fontSize:'.75rem', fontWeight:700, display:'inline-flex', alignItems:'center', gap:4 }}>
                          🏆 View Cert
                        </Link>
                      } else if (isCompleted || rs === 'ready_cert') {
                        actionBtn = <button onClick={() => handleIssueCert(intern.internship_id)} disabled={rs === 'issuing'}
                          style={{ background:'#059669', color:'#fff', border:'none', borderRadius:7, padding:'5px 12px', cursor:'pointer', fontSize:'.75rem', fontWeight:700 }}>
                          {rs === 'issuing' ? 'Issuing...' : '🏅 Issue Cert'}
                        </button>
                      } else {
                        actionBtn = <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                          <button onClick={() => handleMarkDone(intern.internship_id)} disabled={rs === 'marking'}
                            style={{ background:'transparent', color:'#475569', border:'1px solid #e2e8f0', borderRadius:7, padding:'5px 10px', cursor:'pointer', fontSize:'.75rem', fontWeight:700 }}>
                            {rs === 'marking' ? 'Marking...' : '✓ Mark Done'}
                          </button>
                          <button disabled title="Mark as completed first"
                            style={{ background:'#e2e8f0', color:'#94a3b8', border:'none', borderRadius:7, padding:'5px 10px', fontSize:'.75rem', fontWeight:700, cursor:'not-allowed' }}>
                            🏅 Issue Cert
                          </button>
                        </div>
                      }

                      return (
                        <tr key={intern.internship_id} style={{ borderBottom:'1px solid #f1f5f9' }}>
                          <td style={{ padding:'10px 14px', color:'#94a3b8' }}>{idx+1}</td>
                          <td style={{ padding:'10px 14px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                              <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,#4f46e5,#7c3aed)', color:'#fff', fontWeight:700, fontSize:'.8rem', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                {intern.student_name?.charAt(0)}
                              </div>
                              <strong style={{ color:'#1e293b' }}>{intern.student_name}</strong>
                            </div>
                          </td>
                          <td style={{ padding:'10px 14px', color:'#64748b' }}>{intern.roll_no}</td>
                          <td style={{ padding:'10px 14px', color:'#64748b' }}>{intern.department}</td>
                          <td style={{ padding:'10px 14px', fontWeight:600, color:'#1e293b' }}>{intern.company_name}</td>
                          <td style={{ padding:'10px 14px', color:'#64748b' }}>{intern.domain}</td>
                          <td style={{ padding:'10px 14px', color:'#64748b', whiteSpace:'nowrap' }}>{fmt(intern.start_date)}</td>
                          <td style={{ padding:'10px 14px', color:'#64748b', whiteSpace:'nowrap' }}>{fmt(intern.end_date)}</td>
                          <td style={{ padding:'10px 14px' }}>
                            <span style={{ background: isCompleted ? '#d1fae5' : '#fef3c7', color: isCompleted ? '#065f46' : '#92400e', fontSize:'.72rem', fontWeight:700, padding:'3px 10px', borderRadius:99, textTransform:'uppercase', whiteSpace:'nowrap' }}>
                              {intern.status}
                            </span>
                          </td>
                          <td style={{ padding:'10px 14px' }}>{actionBtn}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* CERTIFICATES TABLE */}
            {certs.length > 0 && (
              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.3 }}
                style={{ background:'#fff', borderRadius:12, border:'1px solid #e2e8f0', boxShadow:'0 1px 4px rgba(0,0,0,.06)', overflow:'hidden' }}>
                <div style={{ padding:'12px 20px', borderBottom:'1px solid #e2e8f0', background:'#f0fdf4' }}>
                  <span style={{ fontWeight:700, fontSize:'.9rem', color:'#166534', display:'flex', alignItems:'center', gap:8 }}>🏆 Issued Certificates</span>
                </div>
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'.82rem' }}>
                    <thead>
                      <tr style={{ background:'#f8fafc' }}>
                        {['Cert ID','Student','Roll No','Company','Domain','Issue Date','Action'].map(h => (
                          <th key={h} style={{ padding:'10px 14px', textAlign:'left', color:'#64748b', fontWeight:700, fontSize:'.78rem', borderBottom:'1px solid #e2e8f0' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {certs.map((c,i) => (
                        <tr key={i} style={{ borderBottom:'1px solid #f1f5f9' }}>
                          <td style={{ padding:'10px 14px' }}><span style={{ background:'#d1fae5', color:'#065f46', fontWeight:700, fontSize:'.75rem', padding:'3px 10px', borderRadius:99 }}>CERT-{String(c.certificate_id).padStart(4,'0')}</span></td>
                          <td style={{ padding:'10px 14px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                              <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#4f46e5,#7c3aed)', color:'#fff', fontSize:'.75rem', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>{c.student_name?.charAt(0)}</div>
                              <strong>{c.student_name}</strong>
                            </div>
                          </td>
                          <td style={{ padding:'10px 14px', color:'#64748b' }}>{c.roll_no}</td>
                          <td style={{ padding:'10px 14px' }}>{c.company_name}</td>
                          <td style={{ padding:'10px 14px', color:'#64748b' }}>{c.domain}</td>
                          <td style={{ padding:'10px 14px', color:'#64748b', whiteSpace:'nowrap' }}>{fmt(c.issue_date)}</td>
                          <td style={{ padding:'10px 14px' }}>
                            <Link to={`/student/certificate/${c.internship_id}`}
                              style={{ border:'1px solid #059669', color:'#059669', borderRadius:7, padding:'5px 12px', textDecoration:'none', fontSize:'.75rem', fontWeight:700 }}>
                              👁 View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
