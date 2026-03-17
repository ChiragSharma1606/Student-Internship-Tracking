import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GraduationCap, Printer } from 'lucide-react'
import { getCertificate } from '../../utils/api'
import { useAuth } from '../../context/AuthContext'

const fmt = (d) => { if (!d) return '–'; try { return new Date(d).toLocaleDateString('en-IN', { year:'numeric', month:'short', day:'numeric' }) } catch { return d } }

export default function Certificate() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [cert, setCert] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) { setError('No internship ID provided.'); setLoading(false); return }
    getCertificate(id)
      .then(res => {
        if (res.data.status === 'success') setCert(res.data.data.certificate)
        else setError(res.data.message)
      })
      .catch(() => setError('Failed to load certificate. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [id])

  const backUrl = user?.role === 'faculty' ? '/teacher/dashboard' : '/student/dashboard'

  const weeks = cert ? Math.round((new Date(cert.end_date) - new Date(cert.start_date)) / (7 * 24 * 60 * 60 * 1000)) : 0

  return (
    <div style={{ minHeight:'100vh', background:'#f1f5f9', color:'#0f172a', fontFamily:"'Segoe UI', system-ui, sans-serif" }}>

      {/* NAVBAR */}
      <nav className="no-print" style={{ background:'linear-gradient(135deg,#4f46e5,#6d28d9)', padding:'0 1.5rem', height:60, display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'0 2px 12px rgba(79,70,229,.25)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, color:'#fff', fontWeight:700, fontSize:'1.1rem' }}>
          <GraduationCap size={24} /> InternTrack
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <Link to={backUrl} className="no-print" style={{ color:'rgba(255,255,255,.85)', border:'1px solid rgba(255,255,255,.3)', borderRadius:8, padding:'5px 14px', textDecoration:'none', fontSize:'.82rem', fontWeight:600 }}>
            ← Back
          </Link>
          <button onClick={() => window.print()} className="no-print"
            style={{ background:'#fff', color:'#4f46e5', border:'none', borderRadius:8, padding:'5px 14px', fontSize:'.82rem', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
            <Printer size={14} /> Print / Save PDF
          </button>
        </div>
      </nav>

      <div style={{ maxWidth:900, margin:'2rem auto', padding:'0 1.5rem' }}>

        {/* LOADING */}
        {loading && (
          <div style={{ textAlign:'center', padding:'4rem', color:'#64748b' }}>
            <div style={{ width:36, height:36, border:'4px solid #e2e8f0', borderTop:'4px solid #4f46e5', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto 12px' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            Loading certificate...
          </div>
        )}

        {/* ERROR */}
        {error && !loading && (
          <div style={{ background:'#fef2f2', border:'1px solid #fecaca', color:'#991b1b', borderRadius:12, padding:'1.25rem', textAlign:'center' }}>
            ⚠️ {error}
          </div>
        )}

        {/* CERTIFICATE */}
        {cert && !loading && (
          <>
            {/* Action bar */}
            <div className="no-print" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <span style={{ background:'#d1fae5', color:'#065f46', borderRadius:99, padding:'6px 16px', fontWeight:700, fontSize:'.88rem', display:'flex', alignItems:'center', gap:6 }}>
                ✅ Certificate Issued
              </span>
              <button onClick={() => window.print()}
                style={{ background:'#4f46e5', color:'#fff', border:'none', borderRadius:10, padding:'9px 20px', fontWeight:700, fontSize:'.88rem', cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
                ⬇ Download / Print PDF
              </button>
            </div>

            {/* Certificate design */}
            <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:.5 }}
              style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed,#0891b2)', padding:6, borderRadius:16, boxShadow:'0 8px 40px rgba(0,0,0,.15)' }}
              id="cert-print-area">
              <div style={{ background:'#fff', borderRadius:11, border:'2px solid #e0e7ff', padding:'3.5rem 4rem', position:'relative', textAlign:'center', overflow:'hidden' }}>

                {/* Watermark */}
                <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', fontSize:'10rem', opacity:.03, pointerEvents:'none', color:'#4f46e5' }}>🎓</div>

                {/* Logo */}
                <div style={{ fontWeight:800, fontSize:'1.8rem', color:'#4f46e5', marginBottom:4, display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                  <GraduationCap size={32} /> InternTrack
                </div>
                <div style={{ fontSize:'.75rem', letterSpacing:'3px', textTransform:'uppercase', color:'#64748b', marginBottom:16 }}>Student Internship Tracking System</div>
                <div style={{ width:80, height:4, background:'linear-gradient(135deg,#4f46e5,#7c3aed)', borderRadius:99, margin:'0 auto 24px' }}></div>

                {/* Title */}
                <h1 style={{ fontSize:'clamp(1.8rem, 4vw, 2.8rem)', fontWeight:900, background:'linear-gradient(135deg,#4f46e5,#7c3aed)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginBottom:8, letterSpacing:'-1px' }}>
                  Certificate of Completion
                </h1>
                <p style={{ color:'#64748b', fontSize:'1rem', marginBottom:24 }}>This is to certify that</p>

                {/* Student name */}
                <div style={{ fontSize:'clamp(1.5rem, 4vw, 2.2rem)', fontWeight:800, color:'#1e293b', borderBottom:'3px solid #4f46e5', display:'inline-block', paddingBottom:4, marginBottom:8 }}>
                  {cert.student_name}
                </div>
                <p style={{ color:'#64748b', fontSize:'.9rem', marginBottom:24 }}>{cert.roll_no} • {cert.department}</p>

                <p style={{ color:'#334155', fontSize:'1rem', maxWidth:560, margin:'0 auto 32px', lineHeight:1.8 }}>
                  has successfully completed the internship programme in{' '}
                  <strong>{cert.domain}</strong> at <strong>{cert.company_name}</strong>,
                  for the period from <strong>{fmt(cert.start_date)}</strong> to <strong>{fmt(cert.end_date)}</strong>.
                </p>

                <div style={{ width:80, height:4, background:'linear-gradient(135deg,#4f46e5,#7c3aed)', borderRadius:99, margin:'0 auto 32px' }}></div>

                {/* Details row */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:40 }}>
                  {[['Certificate ID', `#${cert.certificate_id}`], ['Issue Date', fmt(cert.issue_date)], ['Department', cert.department], ['Duration', `${weeks} Weeks`]].map(([k,v]) => (
                    <div key={k} style={{ textAlign:'center' }}>
                      <div style={{ fontSize:'.68rem', textTransform:'uppercase', letterSpacing:'1.5px', color:'#94a3b8', fontWeight:700, marginBottom:4 }}>{k}</div>
                      <div style={{ fontWeight:700, color:'#1e293b', fontSize:'.9rem' }}>{v}</div>
                    </div>
                  ))}
                </div>

                {/* Seal & signatures */}
                <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:20 }}>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ width:140, borderTop:'2px solid #334155', marginBottom:6 }}></div>
                    <div style={{ fontSize:'.68rem', textTransform:'uppercase', letterSpacing:'1.5px', color:'#94a3b8', fontWeight:700 }}>Industry Supervisor</div>
                    <div style={{ color:'#475569', fontSize:'.82rem', marginTop:2 }}>{cert.company_name}</div>
                  </div>

                  <motion.div animate={{ rotate:[0, 5, -5, 0] }} transition={{ duration:3, repeat:Infinity, ease:'easeInOut' }}
                    style={{ width:90, height:90, borderRadius:'50%', background:'linear-gradient(135deg,#4f46e5,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'2.5rem', boxShadow:'0 4px 20px rgba(79,70,229,.35)' }}>
                    🏅
                  </motion.div>

                  <div style={{ textAlign:'center' }}>
                    <div style={{ width:140, borderTop:'2px solid #334155', marginBottom:6 }}></div>
                    <div style={{ fontSize:'.68rem', textTransform:'uppercase', letterSpacing:'1.5px', color:'#94a3b8', fontWeight:700 }}>Faculty Coordinator</div>
                    <div style={{ color:'#475569', fontSize:'.82rem', marginTop:2 }}>InternTrack Faculty</div>
                  </div>
                </div>

                {/* Footer ID */}
                <div style={{ marginTop:32, fontSize:'.7rem', color:'#94a3b8', letterSpacing:'1px' }}>
                  CERT-{String(cert.certificate_id).padStart(6,'0')} • Issued: {fmt(cert.issue_date)} • InternTrack
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body > * { visibility: hidden; }
          #cert-print-area, #cert-print-area * { visibility: visible !important; }
          #cert-print-area { position: fixed; top: 0; left: 0; width: 100%; }
        }
      `}</style>
    </div>
  )
}

