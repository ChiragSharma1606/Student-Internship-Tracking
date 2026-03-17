import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GraduationCap, Building2, BookCheck, CheckCircle2, BarChart3, FileText, Award, Info } from 'lucide-react'

const features = [
  { icon: Building2,   color: '#4f46e5', bg: '#ede9fe', title: 'Industry Management',      desc: 'Track company details, contact persons, and internship domains all in one place.' },
  { icon: BookCheck,   color: '#059669', bg: '#d1fae5', title: 'Weekly Progress Reports',  desc: 'Structured weekly reporting keeps students accountable and faculty informed.' },
  { icon: CheckCircle2,color: '#ea580c', bg: '#ffedd5', title: 'Faculty Approvals',         desc: 'Faculty can approve or reject reports with a single click, with full audit trail.' },
  { icon: BarChart3,   color: '#7c3aed', bg: '#ede9fe', title: 'Progress Analytics',        desc: 'At-a-glance statistics for approved, pending, and rejected reports per student.' },
  { icon: FileText,    color: '#0891b2', bg: '#cffafe', title: 'Final Report Tracking',     desc: 'End-of-internship report submissions tracked and stored for institutional records.' },
  { icon: Award,       color: '#d97706', bg: '#fef3c7', title: 'Certificate Issuance',      desc: 'Completion certificates are tracked within the system and linked to student records.' },
]

export default function Home() {
  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* NAVBAR */}
      <nav style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6d28d9 100%)', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 12px rgba(79,70,229,.25)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <GraduationCap size={28} /> InternTrack
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <a href="#how-it-works" style={{ color: 'rgba(255,255,255,.85)', textDecoration: 'none', fontSize: '.9rem' }}>How it works</a>
            <a href="#features" style={{ color: 'rgba(255,255,255,.85)', textDecoration: 'none', fontSize: '.9rem' }}>Features</a>
            <Link to="/student/login" style={{ color: '#fff', border: '1px solid rgba(255,255,255,.5)', borderRadius: 8, padding: '5px 14px', fontSize: '.85rem', textDecoration: 'none' }}>Student Login</Link>
            <Link to="/teacher/login" style={{ color: '#4f46e5', background: '#fff', borderRadius: 8, padding: '5px 14px', fontSize: '.85rem', fontWeight: 600, textDecoration: 'none' }}>Faculty Login</Link>
          </div>
        </div>
      </nav>

      {/* DEMO BANNER */}
      <div style={{ background: '#fef3c7', color: '#92400e', textAlign: 'center', padding: '8px', fontSize: '.82rem', borderBottom: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <Info size={14} />
        <strong>Demo:</strong>&nbsp;
        Student: <code style={{ background: 'rgba(0,0,0,.08)', padding: '1px 6px', borderRadius: 4 }}>student1 / student123</code>
        &nbsp;|&nbsp;
        Faculty: <code style={{ background: 'rgba(0,0,0,.08)', padding: '1px 6px', borderRadius: 4 }}>teacher1 / teacher123</code>
      </div>

      {/* HERO */}
      <section style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', minHeight: 560, display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '4rem 1.5rem', textAlign: 'center', width: '100%', position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span style={{ background: 'rgba(255,255,255,.15)', color: '#fff', borderRadius: 999, padding: '6px 18px', fontSize: '.9rem', border: '1px solid rgba(255,255,255,.2)', display: 'inline-block', marginBottom: 24 }}>
              ✨ Internship Management, Simplified
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 800, color: '#fff', marginBottom: 20, lineHeight: 1.2, letterSpacing: '-0.5px' }}>
            Track Every Step of<br />Your Internship Journey
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
            style={{ color: 'rgba(255,255,255,.75)', fontSize: '1.1rem', maxWidth: 600, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            A unified platform for students to log weekly progress and for faculty to monitor,
            approve reports, and issue completion certificates — all in one place.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/student/login" style={{ background: '#fff', color: '#4f46e5', fontWeight: 700, padding: '12px 36px', borderRadius: 12, textDecoration: 'none', fontSize: '1rem', boxShadow: '0 4px 20px rgba(0,0,0,.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
              👨‍🎓 Student Portal
            </Link>
            <Link to="/teacher/login" style={{ background: 'rgba(255,255,255,.15)', color: '#fff', fontWeight: 700, padding: '12px 36px', borderRadius: 12, textDecoration: 'none', fontSize: '1rem', border: '1px solid rgba(255,255,255,.3)', display: 'flex', alignItems: 'center', gap: 8 }}>
              👩‍🏫 Faculty Portal
            </Link>
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ background: '#f8fafc', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ background: '#ede9fe', color: '#4f46e5', borderRadius: 999, padding: '4px 16px', fontSize: '.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', display: 'inline-block', marginBottom: 12 }}>Simple Process</span>
            <h2 style={{ fontWeight: 800, fontSize: '2rem', color: '#1e293b', marginBottom: 8 }}>How InternTrack Works</h2>
            <p style={{ color: '#64748b', maxWidth: 500, margin: '0 auto' }}>From internship assignment to final certification — managed seamlessly.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {[
              { num: '1', title: 'Get Assigned', desc: 'Students are assigned to industry partners by faculty. All internship details are set up in the system.', grad: 'linear-gradient(135deg, #4f46e5, #7c3aed)' },
              { num: '2', title: 'Submit Weekly Reports', desc: 'Every week, students log their progress, learnings, and tasks. Faculty reviews and approves each submission.', grad: 'linear-gradient(135deg, #0891b2, #0e7490)' },
              { num: '3', title: 'Get Certified', desc: 'On successful completion, certificates are issued and tracked in the system for future reference.', grad: 'linear-gradient(135deg, #059669, #047857)' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,.1)' }}
                style={{ background: '#fff', borderRadius: 16, padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,.06)', textAlign: 'center', transition: 'all .2s' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: s.grad, color: '#fff', fontWeight: 800, fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>{s.num}</div>
                <h5 style={{ fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>{s.title}</h5>
                <p style={{ color: '#64748b', fontSize: '.88rem', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ background: '#fff', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ background: '#ede9fe', color: '#4f46e5', borderRadius: 999, padding: '4px 16px', fontSize: '.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', display: 'inline-block', marginBottom: 12 }}>Everything You Need</span>
            <h2 style={{ fontWeight: 800, fontSize: '2rem', color: '#1e293b', marginBottom: 8 }}>Platform Features</h2>
            <p style={{ color: '#64748b', maxWidth: 500, margin: '0 auto' }}>Built for both students and faculty with everything needed for smooth internship management.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,.09)' }}
                style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,.06)', transition: 'all .2s' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: f.bg, color: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <f.icon size={22} />
                </div>
                <h6 style={{ fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>{f.title}</h6>
                <p style={{ color: '#64748b', fontSize: '.85rem', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ADMIN STRIP */}
      <div style={{ background: '#0f172a', padding: '1rem', textAlign: 'center' }}>
        <span style={{ color: '#64748b', fontSize: '.85rem', marginRight: 12 }}>System Administrator?</span>
        <Link to="/admin/login" style={{ color: '#ef4444', border: '1px solid #ef4444', borderRadius: 8, padding: '5px 18px', fontSize: '.85rem', textDecoration: 'none' }}>
          🔐 Admin Panel
        </Link>
      </div>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, #3730a3 0%, #4f46e5 100%)', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '1.7rem', marginBottom: 12 }}>Ready to get started?</h3>
        <p style={{ color: 'rgba(255,255,255,.75)', marginBottom: '1.5rem' }}>Log in to your portal and start tracking your internship today.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/student/login" style={{ background: '#fff', color: '#4f46e5', fontWeight: 700, padding: '10px 28px', borderRadius: 10, textDecoration: 'none' }}>Student Login</Link>
          <Link to="/teacher/login" style={{ background: 'transparent', color: '#fff', fontWeight: 700, padding: '10px 28px', borderRadius: 10, textDecoration: 'none', border: '1px solid rgba(255,255,255,.4)' }}>Faculty Login</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0f172a', padding: '1.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontWeight: 700 }}>
            <GraduationCap size={20} color="#818cf8" />
            InternTrack
            <span style={{ color: '#475569', fontWeight: 400, fontSize: '.85rem' }}>© 2026 Student Internship Tracking System</span>
          </div>
          <span style={{ color: '#475569', fontSize: '.85rem' }}>Built with Flask &amp; React</span>
        </div>
      </footer>
    </div>
  )
}
