/**
 * admin.js – InternTrack Admin Panel JavaScript
 * Handles all CRUD operations for the admin dashboard.
 */

// ── INIT ───────────────────────────────────────────────────
requireAuth('admin');
const user = JSON.parse(sessionStorage.getItem('user') || '{}');
document.getElementById('navUser').textContent = user.username || 'admin';

// Cache for dropdowns
let allStudents  = [];
let allIndustry  = [];
let allUsers     = [];

// Bootstrap modal instances
const modals = {};
function getModal(id) {
  if (!modals[id]) modals[id] = new bootstrap.Modal(document.getElementById(id));
  return modals[id];
}

// ── TAB SWITCHING ──────────────────────────────────────────
function showTab(tab, el) {
  // Hide all tabs
  ['users','students','faculty','industry','internships'].forEach(t => {
    document.getElementById(`tab-${t}`).classList.add('d-none');
  });
  document.getElementById(`tab-${tab}`).classList.remove('d-none');

  // Update nav tabs
  document.querySelectorAll('#adminTabs .nav-link').forEach(a => a.classList.remove('active'));
  if (el) el.classList.add('active');

  // Load data for the tab
  const loaders = {
    users:       loadUsers,
    students:    loadStudents,
    faculty:     loadFaculty,
    industry:    loadIndustry,
    internships: loadInternships
  };
  if (loaders[tab]) loaders[tab]();
  return false;
}

function openModal(id) {
  getModal(id).show();
}

// ── LOAD DASHBOARD STATS ───────────────────────────────────
async function loadStats() {
  try {
    const res = await apiGet('/api/admin/dashboard');
    if (res.status === 'success') {
      const s = res.data.stats;
      document.getElementById('statUsers').textContent       = s.total_users;
      document.getElementById('statStudents').textContent    = s.total_students;
      document.getElementById('statFaculty').textContent     = s.total_faculty;
      document.getElementById('statIndustries').textContent  = s.total_industries;
      document.getElementById('statInternships').textContent = s.total_internships;
      document.getElementById('statPending').textContent     = s.pending_reports;
    }
  } catch(e) { console.error('Stats load error', e); }
}

// ── USERS ──────────────────────────────────────────────────
async function loadUsers() {
  const tbody = document.getElementById('usersBody');
  tbody.innerHTML = '<tr><td colspan="5" class="text-center py-3"><span class="spinner-border spinner-border-sm"></span></td></tr>';
  try {
    const res = await apiGet('/api/admin/users');
    allUsers = res.data.users || [];
    tbody.innerHTML = '';
    if (!allUsers.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">No users found.</td></tr>';
      return;
    }
    allUsers.forEach(u => {
      const roleBadge = u.role === 'admin'   ? 'bg-danger'
                      : u.role === 'faculty' ? 'bg-info text-dark'
                      : 'bg-success';
      tbody.innerHTML += `
        <tr>
          <td class="ps-4 text-muted">${u.user_id}</td>
          <td><strong>${u.username}</strong></td>
          <td><span class="badge ${roleBadge}">${capitalize(u.role)}</span></td>
          <td class="text-muted">${formatDate(u.created_at)}</td>
          <td>
            ${u.role !== 'admin' ? `
            <button class="btn btn-outline-primary btn-sm me-1" onclick="editUser(${u.user_id})">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-outline-danger btn-sm" onclick="confirmDelete('user', ${u.user_id}, '${u.username}')">
              <i class="bi bi-trash"></i>
            </button>` : '<span class="text-muted small">Protected</span>'}
          </td>
        </tr>`;
    });
  } catch(e) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger py-3">Failed to load users.</td></tr>';
  }
}

function editUser(userId) {
  const u = allUsers.find(x => x.user_id === userId);
  if (!u) return;
  document.getElementById('userModalTitle').textContent = 'Edit User';
  document.getElementById('userEditId').value   = u.user_id;
  document.getElementById('userUsername').value = u.username;
  document.getElementById('userPassword').value = '';
  document.getElementById('userRole').value     = u.role;
  document.getElementById('userModalError').classList.add('d-none');
  openModal('userModal');
}

async function saveUser() {
  const editId   = document.getElementById('userEditId').value;
  const username = document.getElementById('userUsername').value.trim();
  const password = document.getElementById('userPassword').value.trim();
  const role     = document.getElementById('userRole').value;
  const errDiv   = document.getElementById('userModalError');
  errDiv.classList.add('d-none');

  if (!username || !role) {
    errDiv.textContent = 'Username and role are required.';
    errDiv.classList.remove('d-none');
    return;
  }
  if (!editId && !password) {
    errDiv.textContent = 'Password is required for new users.';
    errDiv.classList.remove('d-none');
    return;
  }

  try {
    let res;
    if (editId) {
      res = await apiPut(`/api/admin/users/${editId}`, { username, password, role });
    } else {
      res = await apiPost('/api/admin/users', { username, password, role });
    }
    if (res.status === 'success') {
      getModal('userModal').hide();
      resetUserModal();
      showToast(res.message, 'success');
      loadUsers();
      loadStats();
    } else {
      errDiv.textContent = res.message;
      errDiv.classList.remove('d-none');
    }
  } catch(e) {
    errDiv.textContent = 'Server error. Please try again.';
    errDiv.classList.remove('d-none');
  }
}

function resetUserModal() {
  document.getElementById('userModalTitle').textContent = 'Add User';
  document.getElementById('userEditId').value   = '';
  document.getElementById('userUsername').value = '';
  document.getElementById('userPassword').value = '';
  document.getElementById('userRole').value     = 'student';
  document.getElementById('userModalError').classList.add('d-none');
}

// ── STUDENTS ───────────────────────────────────────────────
async function loadStudents() {
  const tbody = document.getElementById('studentsBody');
  tbody.innerHTML = '<tr><td colspan="9" class="text-center py-3"><span class="spinner-border spinner-border-sm"></span></td></tr>';
  try {
    const res = await apiGet('/api/admin/students');
    allStudents = res.data.students || [];
    tbody.innerHTML = '';
    if (!allStudents.length) {
      tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted py-3">No students found.</td></tr>';
      return;
    }
    allStudents.forEach(s => {
      tbody.innerHTML += `
        <tr>
          <td class="ps-4 text-muted">${s.student_id}</td>
          <td>
            <div class="d-flex align-items-center gap-2">
              <div class="it-avatar it-avatar--sm">${s.name.charAt(0)}</div>
              <strong>${s.name}</strong>
            </div>
          </td>
          <td class="text-muted">${s.roll_no}</td>
          <td><span class="badge bg-light text-dark border">${s.username}</span></td>
          <td class="text-muted">${s.department}</td>
          <td class="text-muted">Year ${s.year}</td>
          <td class="text-muted">${s.phone || '–'}</td>
          <td class="text-muted">${s.email || '–'}</td>
          <td>
            <button class="btn btn-outline-primary btn-sm me-1" onclick="editStudent(${s.student_id})">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-outline-danger btn-sm" onclick="confirmDelete('student', ${s.student_id}, '${s.name}')">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>`;
    });
  } catch(e) {
    tbody.innerHTML = '<tr><td colspan="9" class="text-center text-danger py-3">Failed to load students.</td></tr>';
  }
}

function toggleInternshipForm(show) {
  const fields = document.getElementById('internshipFormFields');
  fields.style.setProperty('display', show ? 'flex' : 'none', 'important');
  fields.classList.toggle('row', show);
}

async function openModal_student() {
  await Promise.all([refreshUserDropdown(), refreshIndustryForStudent()]);
  resetStudentModal();
  getModal('studentModal').show();
}

async function refreshUserDropdown() {
  const res = await apiGet('/api/admin/users');
  allUsers  = res.data.users || [];
  const sel = document.getElementById('studentUserId');
  sel.innerHTML = '<option value="">— Select user account —</option>';
  allUsers.filter(u => u.role === 'student').forEach(u => {
    sel.innerHTML += `<option value="${u.user_id}">${u.username} (ID: ${u.user_id})</option>`;
  });
}

async function refreshIndustryForStudent() {
  const res = await apiGet('/api/admin/industry');
  allIndustry = res.data.industry || [];
  const sel = document.getElementById('sInternshipIndustryId');
  if (!sel) return;
  sel.innerHTML = '<option value="">— Select company —</option>';
  allIndustry.forEach(i => {
    sel.innerHTML += `<option value="${i.industry_id}">${i.company_name}</option>`;
  });
}

function editStudent(studentId) {
  const s = allStudents.find(x => x.student_id === studentId);
  if (!s) return;
  refreshUserDropdown().then(() => {
    document.getElementById('studentModalTitle').textContent = 'Edit Student Profile';
    document.getElementById('studentEditId').value  = s.student_id;
    document.getElementById('studentUserId').value  = s.user_id;
    document.getElementById('studentName').value    = s.name;
    document.getElementById('studentRoll').value    = s.roll_no;
    document.getElementById('studentDept').value    = s.department;
    document.getElementById('studentYear').value    = s.year;
    document.getElementById('studentPhone').value   = s.phone || '';
    document.getElementById('studentEmail').value   = s.email || '';
    document.getElementById('studentModalError').classList.add('d-none');
    // Hide internship section when editing
    const section = document.getElementById('internshipSection');
    if (section) section.style.display = 'none';
    getModal('studentModal').show();
  });
}

async function saveStudent() {
  const editId     = document.getElementById('studentEditId').value;
  const user_id    = document.getElementById('studentUserId').value;
  const name       = document.getElementById('studentName').value.trim();
  const roll_no    = document.getElementById('studentRoll').value.trim();
  const department = document.getElementById('studentDept').value.trim();
  const year       = document.getElementById('studentYear').value;
  const phone      = document.getElementById('studentPhone').value.trim();
  const email      = document.getElementById('studentEmail').value.trim();
  const errDiv     = document.getElementById('studentModalError');
  errDiv.classList.add('d-none');

  if (!name || !roll_no || !department || !year) {
    errDiv.textContent = 'Name, Roll No, Department, and Year are required.';
    errDiv.classList.remove('d-none');
    return;
  }
  if (!editId && !user_id) {
    errDiv.textContent = 'Please select a user account.';
    errDiv.classList.remove('d-none');
    return;
  }

  try {
    let res;
    if (editId) {
      res = await apiPut(`/api/admin/students/${editId}`, { name, roll_no, department, year, phone, email });
    } else {
      res = await apiPost('/api/admin/students', { user_id, name, roll_no, department, year, phone, email });
    }
    if (res.status === 'success') {
      const studentId = editId || res.data.student_id;

      // Also assign internship if toggle is on (new student only)
      const assignInternship = document.getElementById('assignInternshipToggle').checked;
      if (!editId && assignInternship) {
        const industry_id = document.getElementById('sInternshipIndustryId').value;
        const domain      = document.getElementById('sInternshipDomain').value.trim();
        const start_date  = document.getElementById('sInternshipStart').value;
        const end_date    = document.getElementById('sInternshipEnd').value;
        const status      = document.getElementById('sInternshipStatus').value;

        if (!industry_id || !domain || !start_date || !end_date) {
          errDiv.textContent = 'Student saved! But internship fields are incomplete — please assign internship separately.';
          errDiv.classList.remove('d-none');
          loadStudents(); loadStats();
          return;
        }

        const iRes = await apiPost('/api/admin/internships', {
          student_id: studentId, industry_id, domain, start_date, end_date, status
        });

        if (iRes.status === 'success') {
          showToast(`${res.message} + Internship assigned!`, 'success');
        } else {
          showToast(`Student saved but internship failed: ${iRes.message}`, 'warning');
        }
      } else {
        showToast(res.message, 'success');
      }

      getModal('studentModal').hide();
      resetStudentModal();
      loadStudents();
      loadStats();
    } else {
      errDiv.textContent = res.message;
      errDiv.classList.remove('d-none');
    }
  } catch(e) {
    errDiv.textContent = 'Server error.';
    errDiv.classList.remove('d-none');
  }
}

function resetStudentModal() {
  document.getElementById('studentModalTitle').textContent = 'Add Student Profile';
  document.getElementById('studentEditId').value  = '';
  document.getElementById('studentUserId').value  = '';
  document.getElementById('studentName').value    = '';
  document.getElementById('studentRoll').value    = '';
  document.getElementById('studentDept').value    = '';
  document.getElementById('studentYear').value    = '3';
  document.getElementById('studentPhone').value   = '';
  document.getElementById('studentEmail').value   = '';
  document.getElementById('studentModalError').classList.add('d-none');
  // Reset internship toggle
  const toggle = document.getElementById('assignInternshipToggle');
  if (toggle) { toggle.checked = false; toggleInternshipForm(false); }
  document.getElementById('sInternshipDomain').value  = '';
  document.getElementById('sInternshipStart').value   = '';
  document.getElementById('sInternshipEnd').value     = '';
  document.getElementById('sInternshipStatus').value  = 'ongoing';
  document.getElementById('sInternshipIndustryId').value = '';
  // Show internship section (hidden when editing)
  const section = document.getElementById('internshipSection');
  if (section) section.style.display = '';
}

// ── FACULTY ────────────────────────────────────────────────
async function loadFaculty() {
  const tbody = document.getElementById('facultyBody');
  tbody.innerHTML = '<tr><td colspan="5" class="text-center py-3"><span class="spinner-border spinner-border-sm"></span></td></tr>';
  try {
    const res = await apiGet('/api/admin/faculty');
    const faculty = res.data.faculty || [];
    tbody.innerHTML = '';
    if (!faculty.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">No faculty found.</td></tr>';
      return;
    }
    faculty.forEach(f => {
      tbody.innerHTML += `
        <tr>
          <td class="ps-4 text-muted">${f.user_id}</td>
          <td><strong>${f.username}</strong></td>
          <td><span class="badge bg-info text-dark">Faculty</span></td>
          <td class="text-muted">${formatDate(f.created_at)}</td>
          <td>
            <button class="btn btn-outline-danger btn-sm" onclick="confirmDelete('user', ${f.user_id}, '${f.username}')">
              <i class="bi bi-trash"></i> Remove
            </button>
          </td>
        </tr>`;
    });
  } catch(e) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger py-3">Failed to load faculty.</td></tr>';
  }
}

function openAddFacultyModal() {
  document.getElementById('userModalTitle').textContent = 'Add Faculty Member';
  resetUserModal();
  document.getElementById('userRole').value = 'faculty';
  openModal('userModal');
}

// ── INDUSTRY ───────────────────────────────────────────────
async function loadIndustry() {
  const tbody = document.getElementById('industryBody');
  tbody.innerHTML = '<tr><td colspan="7" class="text-center py-3"><span class="spinner-border spinner-border-sm"></span></td></tr>';
  try {
    const res = await apiGet('/api/admin/industry');
    allIndustry = res.data.industry || [];
    tbody.innerHTML = '';
    if (!allIndustry.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-3">No companies found.</td></tr>';
      return;
    }
    allIndustry.forEach(i => {
      tbody.innerHTML += `
        <tr>
          <td class="ps-4 text-muted">${i.industry_id}</td>
          <td><strong>${i.company_name}</strong></td>
          <td class="text-muted">${i.contact_person || '–'}</td>
          <td class="text-muted">${i.phone || '–'}</td>
          <td class="text-muted">${i.email || '–'}</td>
          <td class="text-muted">${i.address || '–'}</td>
          <td>
            <button class="btn btn-outline-primary btn-sm me-1" onclick="editIndustry(${i.industry_id})">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-outline-danger btn-sm" onclick="confirmDelete('industry', ${i.industry_id}, '${i.company_name}')">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>`;
    });
  } catch(e) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger py-3">Failed to load companies.</td></tr>';
  }
}

function editIndustry(id) {
  const i = allIndustry.find(x => x.industry_id === id);
  if (!i) return;
  document.getElementById('industryModalTitle').textContent = 'Edit Company';
  document.getElementById('industryEditId').value    = i.industry_id;
  document.getElementById('industryName').value      = i.company_name;
  document.getElementById('industryContact').value   = i.contact_person || '';
  document.getElementById('industryPhone').value     = i.phone || '';
  document.getElementById('industryEmail').value     = i.email || '';
  document.getElementById('industryAddress').value   = i.address || '';
  document.getElementById('industryModalError').classList.add('d-none');
  openModal('industryModal');
}

async function saveIndustry() {
  const editId       = document.getElementById('industryEditId').value;
  const company_name = document.getElementById('industryName').value.trim();
  const contact      = document.getElementById('industryContact').value.trim();
  const phone        = document.getElementById('industryPhone').value.trim();
  const email        = document.getElementById('industryEmail').value.trim();
  const address      = document.getElementById('industryAddress').value.trim();
  const errDiv       = document.getElementById('industryModalError');
  errDiv.classList.add('d-none');

  if (!company_name) {
    errDiv.textContent = 'Company name is required.';
    errDiv.classList.remove('d-none');
    return;
  }

  try {
    let res;
    if (editId) {
      res = await apiPut(`/api/admin/industry/${editId}`,
        { company_name, contact_person: contact, phone, email, address });
    } else {
      res = await apiPost('/api/admin/industry',
        { company_name, contact_person: contact, phone, email, address });
    }
    if (res.status === 'success') {
      getModal('industryModal').hide();
      resetIndustryModal();
      showToast(res.message, 'success');
      loadIndustry();
      loadStats();
    } else {
      errDiv.textContent = res.message;
      errDiv.classList.remove('d-none');
    }
  } catch(e) {
    errDiv.textContent = 'Server error.';
    errDiv.classList.remove('d-none');
  }
}

function resetIndustryModal() {
  document.getElementById('industryModalTitle').textContent = 'Add Company';
  ['industryEditId','industryName','industryContact','industryPhone','industryEmail','industryAddress']
    .forEach(id => document.getElementById(id).value = '');
  document.getElementById('industryModalError').classList.add('d-none');
}

// ── INTERNSHIPS ────────────────────────────────────────────
async function loadInternships() {
  const tbody = document.getElementById('internshipsBody');
  tbody.innerHTML = '<tr><td colspan="9" class="text-center py-3"><span class="spinner-border spinner-border-sm"></span></td></tr>';
  try {
    const res = await apiGet('/api/admin/internships');
    const internships = res.data.internships || [];
    tbody.innerHTML = '';
    if (!internships.length) {
      tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted py-3">No internships found.</td></tr>';
      return;
    }
    internships.forEach(i => {
      const statusCls = i.status === 'completed' ? 'bg-success' : 'bg-warning text-dark';
      tbody.innerHTML += `
        <tr>
          <td class="ps-4 text-muted">${i.internship_id}</td>
          <td><strong>${i.student_name}</strong></td>
          <td class="text-muted">${i.roll_no}</td>
          <td>${i.company_name}</td>
          <td class="text-muted">${i.domain}</td>
          <td class="text-muted">${formatDate(i.start_date)}</td>
          <td class="text-muted">${formatDate(i.end_date)}</td>
          <td><span class="badge ${statusCls}">${capitalize(i.status)}</span></td>
          <td>
            <button class="btn btn-outline-primary btn-sm me-1" onclick="editInternship(${i.internship_id})">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-outline-danger btn-sm" onclick="confirmDelete('internship', ${i.internship_id}, '${i.student_name}')">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>`;
    });
    // Cache for edit
    window._internships = internships;
  } catch(e) {
    tbody.innerHTML = '<tr><td colspan="9" class="text-center text-danger py-3">Failed to load internships.</td></tr>';
  }
}

async function openInternshipModal() {
  await refreshInternshipDropdowns();
  resetInternshipModal();
  openModal('internshipModal');
}

async function refreshInternshipDropdowns() {
  const [sRes, iRes] = await Promise.all([
    apiGet('/api/admin/students'),
    apiGet('/api/admin/industry')
  ]);
  allStudents = sRes.data.students || [];
  allIndustry = iRes.data.industry || [];

  const sSel = document.getElementById('internshipStudentId');
  sSel.innerHTML = '<option value="">— Select student —</option>';
  allStudents.forEach(s => {
    sSel.innerHTML += `<option value="${s.student_id}">${s.name} (${s.roll_no})</option>`;
  });

  const iSel = document.getElementById('internshipIndustryId');
  iSel.innerHTML = '<option value="">— Select company —</option>';
  allIndustry.forEach(i => {
    iSel.innerHTML += `<option value="${i.industry_id}">${i.company_name}</option>`;
  });
}

function editInternship(id) {
  const i = (window._internships || []).find(x => x.internship_id === id);
  if (!i) return;
  refreshInternshipDropdowns().then(() => {
    document.getElementById('internshipModalTitle').textContent = 'Edit Internship';
    document.getElementById('internshipEditId').value     = i.internship_id;
    document.getElementById('internshipStudentId').value  = i.student_id;
    document.getElementById('internshipIndustryId').value = i.industry_id;
    document.getElementById('internshipDomain').value     = i.domain;
    document.getElementById('internshipStatus').value     = i.status;
    document.getElementById('internshipStart').value      = i.start_date;
    document.getElementById('internshipEnd').value        = i.end_date;
    document.getElementById('internshipModalError').classList.add('d-none');
    openModal('internshipModal');
  });
}

async function saveInternship() {
  const editId     = document.getElementById('internshipEditId').value;
  const student_id = document.getElementById('internshipStudentId').value;
  const industry_id= document.getElementById('internshipIndustryId').value;
  const domain     = document.getElementById('internshipDomain').value.trim();
  const status     = document.getElementById('internshipStatus').value;
  const start_date = document.getElementById('internshipStart').value;
  const end_date   = document.getElementById('internshipEnd').value;
  const errDiv     = document.getElementById('internshipModalError');
  errDiv.classList.add('d-none');

  if (!student_id || !industry_id || !domain || !start_date || !end_date) {
    errDiv.textContent = 'All fields marked * are required.';
    errDiv.classList.remove('d-none');
    return;
  }

  try {
    let res;
    if (editId) {
      res = await apiPut(`/api/admin/internships/${editId}`,
        { student_id, industry_id, domain, status, start_date, end_date });
    } else {
      res = await apiPost('/api/admin/internships',
        { student_id, industry_id, domain, status, start_date, end_date });
    }
    if (res.status === 'success') {
      getModal('internshipModal').hide();
      resetInternshipModal();
      showToast(res.message, 'success');
      loadInternships();
      loadStats();
    } else {
      errDiv.textContent = res.message;
      errDiv.classList.remove('d-none');
    }
  } catch(e) {
    errDiv.textContent = 'Server error.';
    errDiv.classList.remove('d-none');
  }
}

function resetInternshipModal() {
  document.getElementById('internshipModalTitle').textContent = 'Assign Internship';
  ['internshipEditId','internshipDomain','internshipStart','internshipEnd']
    .forEach(id => document.getElementById(id).value = '');
  document.getElementById('internshipStudentId').value  = '';
  document.getElementById('internshipIndustryId').value = '';
  document.getElementById('internshipStatus').value     = 'ongoing';
  document.getElementById('internshipModalError').classList.add('d-none');
}

// ── DELETE CONFIRM ─────────────────────────────────────────
let _deleteCallback = null;

function confirmDelete(type, id, name) {
  document.getElementById('deleteMsg').textContent =
    `Delete ${type} "${name}"? This action cannot be undone.`;

  _deleteCallback = async () => {
    const endpoints = {
      user:        `/api/admin/users/${id}`,
      student:     `/api/admin/students/${id}`,
      industry:    `/api/admin/industry/${id}`,
      internship:  `/api/admin/internships/${id}`
    };
    try {
      const res = await apiDelete(endpoints[type]);
      getModal('deleteModal').hide();
      if (res.status === 'success') {
        showToast(res.message, 'success');
        // Reload the relevant tab
        const reloaders = {
          user: () => { loadUsers(); loadFaculty(); },
          student: loadStudents,
          industry: loadIndustry,
          internship: loadInternships
        };
        if (reloaders[type]) reloaders[type]();
        loadStats();
      } else {
        showToast(res.message, 'danger');
      }
    } catch(e) {
      showToast('Server error. Could not delete.', 'danger');
    }
  };

  document.getElementById('confirmDeleteBtn').onclick = _deleteCallback;
  openModal('deleteModal');
}

// ── MODAL OPEN OVERRIDES for Internship & Student ──────────
// Override the generic openModal for modals that need dropdown loading
const _origOpenModal = window.openModal;
window.openModal = function(id) {
  if (id === 'internshipModal') { openInternshipModal(); return; }
  if (id === 'studentModal')    { openModal_student(); return; }
  getModal(id).show();
};

// Reset modals on close
document.getElementById('userModal').addEventListener('hidden.bs.modal',       resetUserModal);
document.getElementById('studentModal').addEventListener('hidden.bs.modal',     resetStudentModal);
document.getElementById('industryModal').addEventListener('hidden.bs.modal',    resetIndustryModal);
document.getElementById('internshipModal').addEventListener('hidden.bs.modal',  resetInternshipModal);

// ── API HELPERS (PUT / DELETE) ─────────────────────────────
async function apiPut(endpoint, body = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.json();
}

async function apiDelete(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  });
  return res.json();
}

// ── INITIAL LOAD ───────────────────────────────────────────
loadStats();
loadUsers();  // Default tab is users
