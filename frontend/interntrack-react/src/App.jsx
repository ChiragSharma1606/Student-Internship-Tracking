import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'

// Pages
import Home            from './pages/Home'
import StudentLogin    from './pages/auth/StudentLogin'
import TeacherLogin    from './pages/auth/TeacherLogin'
import AdminLogin      from './pages/auth/AdminLogin'
import StudentDashboard from './pages/student/Dashboard'
import SubmitReport    from './pages/student/SubmitReport'
import StudentReports  from './pages/student/MyReports'
import Certificate     from './pages/student/Certificate'
import TeacherDashboard from './pages/teacher/Dashboard'
import TeacherReports  from './pages/teacher/Reports'
import AdminDashboard  from './pages/admin/Dashboard'

// Protected route wrapper
// role can be a single string or an array of allowed roles
function ProtectedRoute({ children, role }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/" replace />
  if (role) {
    const allowed = Array.isArray(role) ? role : [role]
    if (!allowed.includes(user.role)) return <Navigate to="/" replace />
  }
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/"                  element={<Home />} />
        <Route path="/student/login"     element={<StudentLogin />} />
        <Route path="/teacher/login"     element={<TeacherLogin />} />
        <Route path="/admin/login"       element={<AdminLogin />} />

        {/* Student */}
        <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/submit"    element={<ProtectedRoute role="student"><SubmitReport /></ProtectedRoute>} />
        <Route path="/student/reports"   element={<ProtectedRoute role="student"><StudentReports /></ProtectedRoute>} />
        <Route path="/student/certificate/:id" element={<ProtectedRoute role={["student","faculty","admin"]}><Certificate /></ProtectedRoute>} />

        {/* Teacher */}
        <Route path="/teacher/dashboard" element={<ProtectedRoute role="faculty"><TeacherDashboard /></ProtectedRoute>} />
        <Route path="/teacher/reports"   element={<ProtectedRoute role="faculty"><TeacherReports /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin/dashboard"   element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
