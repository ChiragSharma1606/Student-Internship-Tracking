import { useEffect, useState } from "react"
import { GraduationCap } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import {
  getAdminDashboard, getAdminUsers, createUser, updateUser, deleteUser,
  getAdminStudents, createStudent, updateStudent, deleteStudent,
  getAdminFaculty, getAdminIndustry, createIndustry, updateIndustry, deleteIndustry,
  getAdminInternships, createInternship, updateInternship, deleteInternship
} from "../../utils/api"

const fmt = (d) => { if (!d) return "–"; try { return new Date(d).toLocaleDateString("en-IN",{year:"numeric",month:"short",day:"numeric"}) } catch { return d } }

const NAV_STYLE = { background:"linear-gradient(135deg,#1e1b4b,#dc2626)", height:60, display:"flex", alignItems:"center", padding:"0 1.5rem", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 12px rgba(220,38,38,.3)" }
const TAB_STYLE = (active) => ({ background:active?"#4f46e5":"#fff", color:active?"#fff":"#64748b", border:active?"1px solid #4f46e5":"1px solid #e2e8f0", borderRadius:8, padding:"8px 18px", cursor:"pointer", fontSize:".85rem", fontWeight:700, transition:"all .15s", whiteSpace:"nowrap" })
const CARD = { background:"#fff", borderRadius:12, border:"1px solid #e2e8f0", boxShadow:"0 1px 4px rgba(0,0,0,.06)", overflow:"hidden", marginBottom:20 }
const CH = { padding:"12px 20px", borderBottom:"1px solid #e2e8f0", background:"#f8fafc", display:"flex", alignItems:"center", justifyContent:"space-between" }
const BTN = (color="#4f46e5") => ({ background:color, color:"#fff", border:"none", borderRadius:8, padding:"6px 14px", fontSize:".8rem", fontWeight:700, cursor:"pointer" })
const OUTLINE_BTN = (color="#4f46e5") => ({ background:"transparent", color:color, border:`1px solid ${color}`, borderRadius:8, padding:"6px 14px", fontSize:".8rem", fontWeight:700, cursor:"pointer" })
const INPUT_STYLE = { width:"100%", padding:"9px 12px", border:"2px solid #e2e8f0", borderRadius:8, fontSize:".88rem", outline:"none", color:"#1e293b", fontFamily:"inherit" }
const SELECT_STYLE = { ...{ width:"100%", padding:"9px 12px", border:"2px solid #e2e8f0", borderRadius:8, fontSize:".88rem", outline:"none", color:"#1e293b", fontFamily:"inherit", background:"#fff" } }
const BADGE = { student:{bg:"#d1fae5",color:"#065f46"}, faculty:{bg:"#cffafe",color:"#0e7490"}, admin:{bg:"#fee2e2",color:"#991b1b"}, ongoing:{bg:"#fef3c7",color:"#92400e"}, completed:{bg:"#d1fae5",color:"#065f46"} }

const TH = ({children}) => <th style={{padding:"10px 14px",textAlign:"left",color:"#64748b",fontWeight:700,fontSize:".78rem",borderBottom:"1px solid #e2e8f0",background:"#f8fafc",whiteSpace:"nowrap"}}>{children}</th>
const TD = ({children, bold}) => <td style={{padding:"10px 14px",color:bold?"#1e293b":"#475569",fontWeight:bold?700:400,fontSize:".82rem"}}>{children}</td>

function Modal({title, onClose, onSave, saveLabel="Save", saveColor="#4f46e5", error, children}) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
      <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:520,maxHeight:"90vh",overflow:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.2)"}}>
        <div style={{padding:"1.25rem 1.5rem",borderBottom:"1px solid #e2e8f0",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <h5 style={{fontWeight:800,color:"#1e293b",margin:0}}>{title}</h5>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:"1.3rem",cursor:"pointer",color:"#94a3b8"}}>×</button>
        </div>
        <div style={{padding:"1.5rem"}}>
          {error && <div style={{background:"#fef2f2",border:"1px solid #fecaca",color:"#991b1b",borderRadius:8,padding:"10px 14px",fontSize:".85rem",marginBottom:12}}>⚠️ {error}</div>}
          {children}
        </div>
        <div style={{padding:"1rem 1.5rem",borderTop:"1px solid #e2e8f0",display:"flex",gap:10,justifyContent:"flex-end"}}>
          <button onClick={onClose} style={OUTLINE_BTN("#64748b")}>Cancel</button>
          <button onClick={onSave} style={BTN(saveColor)}>{saveLabel}</button>
        </div>
      </div>
    </div>
  )
}

function FG({label, children}) {
  return <div style={{marginBottom:14}}><label style={{display:"block",fontWeight:600,fontSize:".82rem",color:"#1e293b",marginBottom:5}}>{label}</label>{children}</div>
}

export default function AdminDashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState("users")
  const [stats, setStats] = useState({})
  const [users, setUsers] = useState([])
  const [students, setStudents] = useState([])
  const [faculty, setFaculty] = useState([])
  const [industry, setIndustry] = useState([])
  const [internships, setInternships] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [formErr, setFormErr] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => { await signOut(); navigate("/") }
  const sf = (k) => (v) => setForm(f => ({...f, [k]: typeof v === "string" ? v : v.target.value}))
  const closeModal = () => { setModal(null); setForm({}); setFormErr("") }

  useEffect(() => {
    getAdminDashboard().then(r => { if (r.data.status==="success") setStats(r.data.data.stats) })
    loadTab("users")
  }, [])

  const loadTab = async (t) => {
    setTab(t)
    if (t==="users")       { const r = await getAdminUsers();       if (r.data.status==="success") setUsers(r.data.data.users) }
    if (t==="students")    { const r = await getAdminStudents();     if (r.data.status==="success") setStudents(r.data.data.students) }
    if (t==="faculty")     { const r = await getAdminFaculty();      if (r.data.status==="success") setFaculty(r.data.data.faculty) }
    if (t==="industry")    { const r = await getAdminIndustry();     if (r.data.status==="success") setIndustry(r.data.data.industry) }
    if (t==="internships") { const r = await getAdminInternships();  if (r.data.status==="success") setInternships(r.data.data.internships) }
  }

  const del = async (type, id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      const fns = { user: deleteUser, student: deleteStudent, industry: deleteIndustry, internship: deleteInternship }
      const res = await fns[type](id)
      if (res.data.status === "success") { toast.success(res.data.message); loadTab(tab) }
      else toast.error(res.data.message)
    } catch { toast.error("Server error") }
  }

  const openAdd = (type) => { setForm({ role:"student", status:"ongoing", year:"3" }); setModal({ type, mode:"add" }) }
  const openEdit = (type, row) => { setForm({ ...row }); setModal({ type, mode:"edit", id: row[type+"_id"] || row.user_id }) }

  const save = async () => {
    setFormErr("")
    try {
      let res
      const { type, mode } = modal
      if (type === "user") {
        if (!form.username || !form.role) return setFormErr("Username and role are required.")
        if (mode === "add" && !form.password) return setFormErr("Password is required.")
        res = mode === "add" ? await createUser(form) : await updateUser(modal.id, form)
      } else if (type === "student") {
        if (!form.name || !form.roll_no || !form.department || !form.year) return setFormErr("Name, Roll No, Department, Year are required.")
        if (mode === "add" && !form.user_id) return setFormErr("Please select a user account.")
        res = mode === "add" ? await createStudent(form) : await updateStudent(modal.id, form)
        if (res.data.status === "success" && mode === "add" && form.assign_internship) {
          if (!form.industry_id || !form.domain || !form.start_date || !form.end_date) return setFormErr("Student saved but internship fields incomplete.")
          const sid = res.data.data.student_id
          await createInternship({ student_id: sid, industry_id: form.industry_id, domain: form.domain, start_date: form.start_date, end_date: form.end_date, status: form.status || "ongoing" })
        }
      } else if (type === "industry") {
        if (!form.company_name) return setFormErr("Company name is required.")
        res = mode === "add" ? await createIndustry(form) : await updateIndustry(modal.id, form)
      } else if (type === "internship") {
        if (!form.student_id || !form.industry_id || !form.domain || !form.start_date || !form.end_date) return setFormErr("All required fields must be filled.")
        res = mode === "add" ? await createInternship(form) : await updateInternship(modal.id, form)
      }
      if (res.data.status === "success") { toast.success(res.data.message); closeModal(); loadTab(tab); getAdminDashboard().then(r => { if (r.data.status==="success") setStats(r.data.data.stats) }) }
      else setFormErr(res.data.message)
    } catch { setFormErr("Server error. Please try again.") }
  }

  const statCards = [
    { color:"#4f46e5", icon:"👥", key:"total_users",      lbl:"Total Users" },
    { color:"#059669", icon:"🎓", key:"total_students",    lbl:"Students" },
    { color:"#0891b2", icon:"🏫", key:"total_faculty",     lbl:"Faculty" },
    { color:"#d97706", icon:"🏢", key:"total_industries",  lbl:"Companies" },
    { color:"#7c3aed", icon:"💼", key:"total_internships", lbl:"Internships" },
    { color:"#ef4444", icon:"⏳", key:"pending_reports",   lbl:"Pending Reports" },
  ]

  const studentUsers = users.filter(u => u.role === "student")

  return (
    <div style={{minHeight:"100vh", background:"#f8fafc", fontFamily:"'Segoe UI', system-ui, sans-serif", color:"#0f172a"}}>

      {/* NAVBAR */}
      <nav style={{background:"linear-gradient(135deg,#1e1b4b,#dc2626)",height:60,display:"flex",alignItems:"center",padding:"0 2rem",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 12px rgba(220,38,38,.3)"}}>
        <div style={{display:"flex", alignItems:"center", gap:10, color:"#fff", fontWeight:800, fontSize:"1.1rem"}}>
          <GraduationCap size={24}/> InternTrack
          <span style={{background:"rgba(255,255,255,.2)", fontSize:".72rem", padding:"2px 10px", borderRadius:99}}>Admin</span>
        </div>
        <div style={{display:"flex", alignItems:"center", gap:12}}>
          <span style={{color:"rgba(255,255,255,.6)", fontSize:".82rem"}}>🔐 {user?.username}</span>
          <button onClick={handleLogout} style={{background:"rgba(255,255,255,.15)", color:"#fff", border:"1px solid rgba(255,255,255,.3)", borderRadius:8, padding:"5px 14px", cursor:"pointer", fontSize:".82rem", fontWeight:700}}>Logout</button>
        </div>
      </nav>

      <div style={{maxWidth:1200, margin:"0 auto", padding:"2rem 2rem"}}>

        {/* HEADER */}
        <div style={{marginBottom:"1.5rem"}}>
          <h4 style={{fontWeight:800, color:"#1e293b", margin:"0 0 2px"}}>Admin Dashboard</h4>
          <p style={{color:"#64748b", fontSize:".88rem", margin:0}}>Manage students, faculty, companies, and internship assignments</p>
        </div>

        {/* STATS */}
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))", gap:16, marginBottom:"1.5rem"}}>
          {statCards.map((s,i) => (
            <div key={i} style={{background:"#fff", borderRadius:12, border:"1px solid #e2e8f0", borderTop:`4px solid ${s.color}`, padding:"1.25rem 1rem", display:"flex", alignItems:"center", gap:14, boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}>
              <div style={{width:48,height:48,borderRadius:12,background:s.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.5rem",flexShrink:0}}>{s.icon}</div>
              <div>
                <div style={{fontSize:"1.8rem", fontWeight:800, color:"#1e293b", lineHeight:1}}>{stats[s.key] ?? "–"}</div>
                <div style={{fontSize:".78rem", color:"#64748b", marginTop:4, fontWeight:500}}>{s.lbl}</div>
              </div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div style={{background:"#fff", borderRadius:12, border:"1px solid #e2e8f0", padding:"1rem 1.25rem", marginBottom:"1.5rem", display:"flex", gap:8, flexWrap:"wrap", boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}>
          {[["users","👥 Users"],["students","🎓 Students"],["faculty","🏫 Faculty"],["industry","🏢 Companies"],["internships","💼 Internships"]].map(([k,l]) => (
            <button key={k} onClick={() => loadTab(k)} style={TAB_STYLE(tab===k)}>{l}</button>
          ))}
        </div>

        {/* ── USERS TAB ── */}
        {tab === "users" && (
          <div style={CARD}>
            <div style={CH}>
              <span style={{fontWeight:700, fontSize:".9rem", color:"#1e293b"}}>👥 All Users</span>
              <button onClick={() => openAdd("user")} style={BTN()}>+ Add User</button>
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%", borderCollapse:"collapse"}}>
                <thead><tr><TH>ID</TH><TH>Username</TH><TH>Role</TH><TH>Created</TH><TH>Actions</TH></tr></thead>
                <tbody>
                  {users.length === 0 ? <tr><td colSpan={5} style={{textAlign:"center",padding:"2rem",color:"#94a3b8"}}>No users found.</td></tr>
                  : users.map(u => {
                    const b = BADGE[u.role] || {}
                    return (
                      <tr key={u.user_id} style={{borderBottom:"1px solid #f1f5f9"}}>
                        <TD>{u.user_id}</TD>
                        <TD bold>{u.username}</TD>
                        <TD><span style={{background:b.bg,color:b.color,borderRadius:99,padding:"3px 10px",fontSize:".72rem",fontWeight:700,textTransform:"uppercase"}}>{u.role}</span></TD>
                        <TD>{fmt(u.created_at)}</TD>
                        <td style={{padding:"10px 14px"}}>
                          {u.role === "admin" ? <span style={{color:"#94a3b8",fontSize:".78rem"}}>Protected</span> : (
                            <div style={{display:"flex",gap:6}}>
                              <button onClick={() => openEdit("user",u)} style={OUTLINE_BTN()}>✏️ Edit</button>
                              <button onClick={() => del("user",u.user_id,u.username)} style={OUTLINE_BTN("#ef4444")}>🗑 Delete</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── STUDENTS TAB ── */}
        {tab === "students" && (
          <div style={CARD}>
            <div style={CH}>
              <span style={{fontWeight:700,fontSize:".9rem",color:"#1e293b"}}>🎓 Student Profiles</span>
              <button onClick={() => { getAdminUsers().then(r=>{if(r.data.status==="success")setUsers(r.data.data.users)}); getAdminIndustry().then(r=>{if(r.data.status==="success")setIndustry(r.data.data.industry)}); openAdd("student") }} style={BTN("#059669")}>+ Add Student</button>
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr><TH>ID</TH><TH>Name</TH><TH>Roll No</TH><TH>Username</TH><TH>Dept</TH><TH>Year</TH><TH>Phone</TH><TH>Email</TH><TH>Actions</TH></tr></thead>
                <tbody>
                  {students.length === 0 ? <tr><td colSpan={9} style={{textAlign:"center",padding:"2rem",color:"#94a3b8"}}>No students found.</td></tr>
                  : students.map(s => (
                    <tr key={s.student_id} style={{borderBottom:"1px solid #f1f5f9"}}>
                      <TD>{s.student_id}</TD>
                      <td style={{padding:"10px 14px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,#4f46e5,#7c3aed)",color:"#fff",fontWeight:700,fontSize:".78rem",display:"flex",alignItems:"center",justifyContent:"center"}}>{s.name?.charAt(0)}</div>
                          <strong style={{color:"#1e293b",fontSize:".82rem"}}>{s.name}</strong>
                        </div>
                      </td>
                      <TD>{s.roll_no}</TD>
                      <TD><span style={{background:"#f1f5f9",padding:"2px 8px",borderRadius:6,fontSize:".75rem"}}>{s.username}</span></TD>
                      <TD>{s.department}</TD>
                      <TD>Year {s.year}</TD>
                      <TD>{s.phone||"–"}</TD>
                      <TD>{s.email||"–"}</TD>
                      <td style={{padding:"10px 14px"}}>
                        <div style={{display:"flex",gap:6}}>
                          <button onClick={() => openEdit("student",s)} style={OUTLINE_BTN()}>✏️</button>
                          <button onClick={() => del("student",s.student_id,s.name)} style={OUTLINE_BTN("#ef4444")}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── FACULTY TAB ── */}
        {tab === "faculty" && (
          <div style={CARD}>
            <div style={CH}>
              <span style={{fontWeight:700,fontSize:".9rem",color:"#1e293b"}}>🏫 Faculty Members</span>
              <button onClick={() => { setForm({role:"faculty"}); setModal({type:"user",mode:"add"}) }} style={BTN("#0891b2")}>+ Add Faculty</button>
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr><TH>ID</TH><TH>Username</TH><TH>Role</TH><TH>Created</TH><TH>Actions</TH></tr></thead>
                <tbody>
                  {faculty.length === 0 ? <tr><td colSpan={5} style={{textAlign:"center",padding:"2rem",color:"#94a3b8"}}>No faculty found.</td></tr>
                  : faculty.map(f => (
                    <tr key={f.user_id} style={{borderBottom:"1px solid #f1f5f9"}}>
                      <TD>{f.user_id}</TD><TD bold>{f.username}</TD>
                      <TD><span style={{background:"#cffafe",color:"#0e7490",borderRadius:99,padding:"3px 10px",fontSize:".72rem",fontWeight:700}}>Faculty</span></TD>
                      <TD>{fmt(f.created_at)}</TD>
                      <td style={{padding:"10px 14px"}}><button onClick={() => del("user",f.user_id,f.username)} style={OUTLINE_BTN("#ef4444")}>🗑 Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── INDUSTRY TAB ── */}
        {tab === "industry" && (
          <div style={CARD}>
            <div style={CH}>
              <span style={{fontWeight:700,fontSize:".9rem",color:"#1e293b"}}>🏢 Companies / Industry</span>
              <button onClick={() => openAdd("industry")} style={BTN("#d97706")}>+ Add Company</button>
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr><TH>ID</TH><TH>Company</TH><TH>Contact</TH><TH>Phone</TH><TH>Email</TH><TH>Address</TH><TH>Actions</TH></tr></thead>
                <tbody>
                  {industry.length === 0 ? <tr><td colSpan={7} style={{textAlign:"center",padding:"2rem",color:"#94a3b8"}}>No companies found.</td></tr>
                  : industry.map(c => (
                    <tr key={c.industry_id} style={{borderBottom:"1px solid #f1f5f9"}}>
                      <TD>{c.industry_id}</TD><TD bold>{c.company_name}</TD>
                      <TD>{c.contact_person||"–"}</TD><TD>{c.phone||"–"}</TD><TD>{c.email||"–"}</TD><TD>{c.address||"–"}</TD>
                      <td style={{padding:"10px 14px"}}>
                        <div style={{display:"flex",gap:6}}>
                          <button onClick={() => openEdit("industry",{...c,industry_id:c.industry_id})} style={OUTLINE_BTN()}>✏️</button>
                          <button onClick={() => del("industry",c.industry_id,c.company_name)} style={OUTLINE_BTN("#ef4444")}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── INTERNSHIPS TAB ── */}
        {tab === "internships" && (
          <div style={CARD}>
            <div style={CH}>
              <span style={{fontWeight:700,fontSize:".9rem",color:"#1e293b"}}>💼 Internship Assignments</span>
              <button onClick={() => { getAdminStudents().then(r=>{if(r.data.status==="success")setStudents(r.data.data.students)}); getAdminIndustry().then(r=>{if(r.data.status==="success")setIndustry(r.data.data.industry)}); openAdd("internship") }} style={BTN("#7c3aed")}>+ Assign Internship</button>
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr><TH>ID</TH><TH>Student</TH><TH>Roll No</TH><TH>Company</TH><TH>Domain</TH><TH>Start</TH><TH>End</TH><TH>Status</TH><TH>Actions</TH></tr></thead>
                <tbody>
                  {internships.length === 0 ? <tr><td colSpan={9} style={{textAlign:"center",padding:"2rem",color:"#94a3b8"}}>No internships found.</td></tr>
                  : internships.map(i => {
                    const b = BADGE[i.status] || {}
                    return (
                      <tr key={i.internship_id} style={{borderBottom:"1px solid #f1f5f9"}}>
                        <TD>{i.internship_id}</TD><TD bold>{i.student_name}</TD><TD>{i.roll_no}</TD>
                        <TD bold>{i.company_name}</TD><TD>{i.domain}</TD>
                        <TD>{fmt(i.start_date)}</TD><TD>{fmt(i.end_date)}</TD>
                        <TD><span style={{background:b.bg,color:b.color,borderRadius:99,padding:"3px 10px",fontSize:".72rem",fontWeight:700,textTransform:"uppercase"}}>{i.status}</span></TD>
                        <td style={{padding:"10px 14px"}}>
                          <div style={{display:"flex",gap:6}}>
                            <button onClick={() => { getAdminStudents().then(r=>{if(r.data.status==="success")setStudents(r.data.data.students)}); getAdminIndustry().then(r=>{if(r.data.status==="success")setIndustry(r.data.data.industry)}); openEdit("internship",{...i,internship_id:i.internship_id}) }} style={OUTLINE_BTN()}>✏️</button>
                            <button onClick={() => del("internship",i.internship_id,i.student_name)} style={OUTLINE_BTN("#ef4444")}>🗑</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── MODALS ── */}
      {modal && (
        <Modal title={modal.mode==="add" ? `Add ${modal.type.charAt(0).toUpperCase()+modal.type.slice(1)}` : `Edit ${modal.type.charAt(0).toUpperCase()+modal.type.slice(1)}`}
          onClose={closeModal} onSave={save} error={formErr}
          saveColor={modal.type==="student"?"#059669":modal.type==="industry"?"#d97706":modal.type==="internship"?"#7c3aed":"#4f46e5"}>

          {/* USER MODAL */}
          {modal.type === "user" && (<>
            <FG label="Username *"><input style={INPUT_STYLE} value={form.username||""} onChange={sf("username")} placeholder="e.g. student4"/></FG>
            <FG label={`Password ${modal.mode==="edit"?"(leave blank to keep)":"*"}`}><input style={INPUT_STYLE} type="password" value={form.password||""} onChange={sf("password")} placeholder="Enter password"/></FG>
            <FG label="Role *"><select style={SELECT_STYLE} value={form.role||"student"} onChange={sf("role")}>
              <option value="student">Student</option><option value="faculty">Faculty</option><option value="admin">Admin</option>
            </select></FG>
          </>)}

          {/* STUDENT MODAL */}
          {modal.type === "student" && (<>
            {modal.mode === "add" && <FG label="User Account *"><select style={SELECT_STYLE} value={form.user_id||""} onChange={sf("user_id")}>
              <option value="">— Select student user —</option>
              {studentUsers.map(u => <option key={u.user_id} value={u.user_id}>{u.username} (ID: {u.user_id})</option>)}
            </select></FG>}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <FG label="Full Name *"><input style={INPUT_STYLE} value={form.name||""} onChange={sf("name")} placeholder="e.g. Alice Johnson"/></FG>
              <FG label="Roll Number *"><input style={INPUT_STYLE} value={form.roll_no||""} onChange={sf("roll_no")} placeholder="e.g. CS2021004"/></FG>
              <FG label="Department *"><input style={INPUT_STYLE} value={form.department||""} onChange={sf("department")} placeholder="e.g. Computer Science"/></FG>
              <FG label="Year *"><select style={SELECT_STYLE} value={form.year||"3"} onChange={sf("year")}>
                {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
              </select></FG>
              <FG label="Phone"><input style={INPUT_STYLE} value={form.phone||""} onChange={sf("phone")} placeholder="e.g. 9876543213"/></FG>
              <FG label="Email"><input style={INPUT_STYLE} value={form.email||""} onChange={sf("email")} placeholder="student@college.edu"/></FG>
            </div>
            {modal.mode === "add" && (<>
              <div style={{borderTop:"1px solid #e2e8f0",marginTop:16,paddingTop:16}}>
                <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontWeight:600,fontSize:".85rem",color:"#1e293b",marginBottom:form.assign_internship?12:0}}>
                  <input type="checkbox" checked={!!form.assign_internship} onChange={e => setForm(f=>({...f,assign_internship:e.target.checked}))} style={{width:16,height:16}}/>
                  Also assign an internship <span style={{background:"#e2e8f0",color:"#64748b",fontSize:".7rem",padding:"1px 8px",borderRadius:99,fontWeight:500,marginLeft:4}}>Optional</span>
                </label>
                {form.assign_internship && (
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:12}}>
                    <FG label="Company *"><select style={SELECT_STYLE} value={form.industry_id||""} onChange={sf("industry_id")}>
                      <option value="">— Select company —</option>
                      {industry.map(c => <option key={c.industry_id} value={c.industry_id}>{c.company_name}</option>)}
                    </select></FG>
                    <FG label="Domain *"><input style={INPUT_STYLE} value={form.domain||""} onChange={sf("domain")} placeholder="e.g. Web Development"/></FG>
                    <FG label="Start Date *"><input style={INPUT_STYLE} type="date" value={form.start_date||""} onChange={sf("start_date")}/></FG>
                    <FG label="End Date *"><input style={INPUT_STYLE} type="date" value={form.end_date||""} onChange={sf("end_date")}/></FG>
                    <FG label="Status"><select style={SELECT_STYLE} value={form.status||"ongoing"} onChange={sf("status")}>
                      <option value="ongoing">Ongoing</option><option value="completed">Completed</option>
                    </select></FG>
                  </div>
                )}
              </div>
            </>)}
          </>)}

          {/* INDUSTRY MODAL */}
          {modal.type === "industry" && (<>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <FG label="Company Name *"><input style={INPUT_STYLE} value={form.company_name||""} onChange={sf("company_name")} placeholder="e.g. TechCorp Solutions"/></FG>
              <FG label="Contact Person"><input style={INPUT_STYLE} value={form.contact_person||""} onChange={sf("contact_person")} placeholder="e.g. Mr. Raj Sharma"/></FG>
              <FG label="Phone"><input style={INPUT_STYLE} value={form.phone||""} onChange={sf("phone")} placeholder="9001234567"/></FG>
              <FG label="Email"><input style={INPUT_STYLE} value={form.email||""} onChange={sf("email")} placeholder="hr@company.com"/></FG>
            </div>
            <FG label="Address"><input style={INPUT_STYLE} value={form.address||""} onChange={sf("address")} placeholder="123 Tech Park, Bangalore"/></FG>
          </>)}

          {/* INTERNSHIP MODAL */}
          {modal.type === "internship" && (<>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <FG label="Student *"><select style={SELECT_STYLE} value={form.student_id||""} onChange={sf("student_id")}>
                <option value="">— Select student —</option>
                {students.map(s => <option key={s.student_id} value={s.student_id}>{s.name} ({s.roll_no})</option>)}
              </select></FG>
              <FG label="Company *"><select style={SELECT_STYLE} value={form.industry_id||""} onChange={sf("industry_id")}>
                <option value="">— Select company —</option>
                {industry.map(c => <option key={c.industry_id} value={c.industry_id}>{c.company_name}</option>)}
              </select></FG>
              <FG label="Domain *"><input style={INPUT_STYLE} value={form.domain||""} onChange={sf("domain")} placeholder="e.g. Web Development"/></FG>
              <FG label="Status"><select style={SELECT_STYLE} value={form.status||"ongoing"} onChange={sf("status")}>
                <option value="ongoing">Ongoing</option><option value="completed">Completed</option>
              </select></FG>
              <FG label="Start Date *"><input style={INPUT_STYLE} type="date" value={form.start_date||""} onChange={sf("start_date")}/></FG>
              <FG label="End Date *"><input style={INPUT_STYLE} type="date" value={form.end_date||""} onChange={sf("end_date")}/></FG>
            </div>
          </>)}
        </Modal>
      )}
    </div>
  )
}

