/**
 * api.js – Axios-based API client for InternTrack
 * All requests include credentials (cookies) for session auth.
 */

import axios from 'axios'

const api = axios.create({
  baseURL: '/api',          // proxied to http://127.0.0.1:5000/api via Vite
  withCredentials: true,    // send session cookies
  headers: { 'Content-Type': 'application/json' }
})

// ── AUTH ────────────────────────────────────────
export const login  = (data) => api.post('/login', data)
export const logout = ()     => api.post('/logout')

// ── STUDENT ─────────────────────────────────────
export const getStudentDashboard  = ()     => api.get('/student/dashboard')
export const getStudentProgress   = ()     => api.get('/student/progress')
export const getStudentInternship = ()     => api.get('/student/internship')
export const submitReport         = (data) => api.post('/student/submit-report', data)

// ── TEACHER ─────────────────────────────────────
export const getTeacherDashboard  = ()     => api.get('/teacher/dashboard')
export const getTeacherReports    = ()     => api.get('/teacher/reports')
export const approveReport        = (data) => api.post('/teacher/approve-report', data)
export const markCompleted        = (data) => api.post('/teacher/mark-completed', data)
export const generateCertificate  = (data) => api.post('/teacher/generate-certificate', data)
export const getAllCertificates    = ()     => api.get('/teacher/all-certificates')

// ── CERTIFICATE ──────────────────────────────────
export const getCertificate = (id) => api.get(`/certificate/${id}`)

// ── ADMIN ────────────────────────────────────────
export const getAdminDashboard   = ()           => api.get('/admin/dashboard')
export const getAdminUsers       = ()           => api.get('/admin/users')
export const createUser          = (data)       => api.post('/admin/users', data)
export const updateUser          = (id, data)   => api.put(`/admin/users/${id}`, data)
export const deleteUser          = (id)         => api.delete(`/admin/users/${id}`)
export const getAdminStudents    = ()           => api.get('/admin/students')
export const createStudent       = (data)       => api.post('/admin/students', data)
export const updateStudent       = (id, data)   => api.put(`/admin/students/${id}`, data)
export const deleteStudent       = (id)         => api.delete(`/admin/students/${id}`)
export const getAdminFaculty     = ()           => api.get('/admin/faculty')
export const getAdminIndustry    = ()           => api.get('/admin/industry')
export const createIndustry      = (data)       => api.post('/admin/industry', data)
export const updateIndustry      = (id, data)   => api.put(`/admin/industry/${id}`, data)
export const deleteIndustry      = (id)         => api.delete(`/admin/industry/${id}`)
export const getAdminInternships = ()           => api.get('/admin/internships')
export const createInternship    = (data)       => api.post('/admin/internships', data)
export const updateInternship    = (id, data)   => api.put(`/admin/internships/${id}`, data)
export const deleteInternship    = (id)         => api.delete(`/admin/internships/${id}`)

export default api
