import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GraduationCap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const GRADIENTS = {
  student: 'linear-gradient(135deg, #4f46e5 0%, #6d28d9 100%)',
  faculty: 'linear-gradient(135deg, #4f46e5 0%, #6d28d9 100%)',
  admin:   'linear-gradient(135deg, #1e1b4b 0%, #dc2626 100%)',
}

export default function Navbar({ links = [], role = 'student' }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    toast.success('Logged out successfully')
    navigate('/')
  }

  return (
    <motion.nav initial={{ y: -64, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }}
      style={{ background: GRADIENTS[role], position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 12px rgba(79,70,229,.25)' }}>
      <div style={{ maxWidth: '100%', padding: '0 1.5rem', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Brand */}
        <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <GraduationCap size={26} />
          InternTrack
          {role === 'admin' && (
            <span style={{ background: 'rgba(255,255,255,.2)', fontSize: '.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99, marginLeft: 4 }}>Admin</span>
          )}
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ color: 'rgba(255,255,255,.6)', fontSize: '.82rem' }}>
            👤 {user?.username}
          </span>
          {links.map((link) => (
            <Link key={link.to} to={link.to}
              style={{ color: 'rgba(255,255,255,.85)', textDecoration: 'none', fontSize: '.82rem', fontWeight: 600,
                       background: 'rgba(255,255,255,.12)', borderRadius: 8, padding: '5px 12px',
                       border: '1px solid rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', gap: 5 }}>
              {link.icon && <link.icon size={14} />}
              {link.label}
            </Link>
          ))}
          {links.certLink && (
            <Link to={links.certLink}
              style={{ color: '#1e293b', textDecoration: 'none', fontSize: '.82rem', fontWeight: 700,
                       background: '#fbbf24', borderRadius: 8, padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 5 }}>
              🏆 My Certificate
            </Link>
          )}
          <button onClick={handleLogout}
            style={{ color: '#fff', fontSize: '.82rem', fontWeight: 700, background: '#ef4444',
                     border: 'none', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            ↩ Logout
          </button>
        </div>
      </div>
    </motion.nav>
  )
}
