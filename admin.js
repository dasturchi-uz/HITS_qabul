// Hackathon IT School CRM Admin JavaScript

// Configuration - Replace with your Supabase credentials
const SUPABASE_URL = 'https://halphorcsdtrnudluqzt.supabase.co';
const SUPABASE_KEY = 'sb_publishable_E2yIxlz8GswFJn-zfnzpxQ_ZsxqEMoy';

// Initialize Supabase
let supabase;
try {
  if (window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  } else {
    console.error('Supabase library not loaded');
  }
} catch (error) {
  console.error('Supabase initialization error:', error);
}

// Global state
let currentUser = null;
let currentPage = 'dashboard';
let applicationsChart = null;
let statusChart = null;

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const adminPanel = document.getElementById('adminPanel');
const loginForm = document.getElementById('loginForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginError = document.getElementById('loginError');
const loginBtnText = document.getElementById('loginBtnText');
const loginSpinner = document.getElementById('loginSpinner');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupEventListeners();
});

// Check authentication
async function checkAuth() {
  const token = localStorage.getItem('authToken');
  const userData = localStorage.getItem('userData');
  
  if (token && userData) {
    currentUser = JSON.parse(userData);
    showAdminPanel();
    loadDashboard();
  } else {
    showLoginScreen();
  }
}

// Show login screen
function showLoginScreen() {
  loginScreen.style.display = 'flex';
  adminPanel.style.display = 'none';
}

// Show admin panel
function showAdminPanel() {
  loginScreen.style.display = 'none';
  adminPanel.style.display = 'flex';
  
  // Update user info
  document.getElementById('currentUserName').textContent = currentUser.full_name || 'Admin';
  document.getElementById('currentUserRole').textContent = getRoleName(currentUser.role);
}

// Get role name in Uzbek
function getRoleName(role) {
  const roles = {
    'admin': 'Administrator',
    'manager': 'Menejer',
    'operator': 'Operator'
  };
  return roles[role] || role;
}

// Setup event listeners
function setupEventListeners() {
  // Login form
  loginForm.addEventListener('submit', handleLogin);
  
  // Logout
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
  
  // Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = item.dataset.page;
      navigateTo(page);
    });
  });
  
  // Menu toggle
  document.getElementById('menuToggle').addEventListener('click', toggleSidebar);
  
  // Refresh button
  document.getElementById('refreshBtn').addEventListener('click', refreshCurrentPage);
  
  // Global search
  document.getElementById('globalSearch').addEventListener('input', handleGlobalSearch);
  
  // Application filters
  document.getElementById('statusFilter')?.addEventListener('change', loadApplications);
  document.getElementById('trackFilter')?.addEventListener('change', loadApplications);
  document.getElementById('applicationSearch')?.addEventListener('input', debounce(loadApplications, 300));
  
  // Add application button
  document.getElementById('addApplicationBtn')?.addEventListener('click', () => openApplicationModal());
  
  // Application form
  document.getElementById('applicationForm')?.addEventListener('submit', handleApplicationSubmit);
  document.getElementById('closeApplicationModal')?.addEventListener('click', () => closeApplicationModal());
  document.getElementById('cancelApplication')?.addEventListener('click', () => closeApplicationModal());
  
  // Communication form
  document.getElementById('communicationForm')?.addEventListener('submit', handleCommunicationSubmit);
  document.getElementById('closeCommunicationModal')?.addEventListener('click', () => closeCommunicationModal());
  document.getElementById('cancelCommunication')?.addEventListener('click', () => closeCommunicationModal());
  document.getElementById('addCommunicationBtn')?.addEventListener('click', () => openCommunicationModal());
  
  // Task form
  document.getElementById('taskForm')?.addEventListener('submit', handleTaskSubmit);
  document.getElementById('closeTaskModal')?.addEventListener('click', () => closeTaskModal());
  document.getElementById('cancelTask')?.addEventListener('click', () => closeTaskModal());
  document.getElementById('addTaskBtn')?.addEventListener('click', () => openTaskModal());
  
  // Payment form
  document.getElementById('paymentForm')?.addEventListener('submit', handlePaymentSubmit);
  document.getElementById('closePaymentModal')?.addEventListener('click', () => closePaymentModal());
  document.getElementById('cancelPayment')?.addEventListener('click', () => closePaymentModal());
  document.getElementById('addPaymentBtn')?.addEventListener('click', () => openPaymentModal());
  
  // User form
  document.getElementById('userForm')?.addEventListener('submit', handleUserSubmit);
  document.getElementById('closeUserModal')?.addEventListener('click', () => closeUserModal());
  document.getElementById('cancelUser')?.addEventListener('click', () => closeUserModal());
  document.getElementById('addUserBtn')?.addEventListener('click', () => openUserModal());
  
  // School settings form
  document.getElementById('schoolSettingsForm')?.addEventListener('submit', handleSchoolSettings);
  
  // Chart period filter
  document.getElementById('chartPeriod')?.addEventListener('change', loadDashboard);
  
  // Pagination
  document.getElementById('prevPage')?.addEventListener('click', () => changePage(-1));
  document.getElementById('nextPage')?.addEventListener('click', () => changePage(1));
  
  // Close modals on outside click
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('show');
      }
    });
  });
}

// Handle login
async function handleLogin(e) {
  e.preventDefault();
  
  const email = loginEmail.value.trim();
  const password = loginPassword.value;
  
  if (!email || !password) {
    showLoginError('Email va parolni kiriting');
    return;
  }
  
  showLoginLoading(true);
  loginError.classList.remove('show');
  
  try {
    // For demo purposes, using simple authentication
    // In production, use Supabase Auth
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !data) {
      showLoginError('Email yoki parol notog\'ri');
      showLoginLoading(false);
      return;
    }
    
    // Simple password check (in production, use proper hashing)
    if (data.password_hash !== password) {
      showLoginError('Email yoki parol notog\'ri');
      showLoginLoading(false);
      return;
    }
    
    if (!data.is_active) {
      showLoginError('Hisobingiz faol emas');
      showLoginLoading(false);
      return;
    }
    
    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', data.id);
    
    // Store auth data
    localStorage.setItem('authToken', 'demo_token_' + data.id);
    localStorage.setItem('userData', JSON.stringify(data));
    
    currentUser = data;
    showAdminPanel();
    loadDashboard();
    
  } catch (error) {
    console.error('Login error:', error);
    showLoginError('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    showLoginLoading(false);
  }
}

// Show login error
function showLoginError(message) {
  loginError.textContent = message;
  loginError.classList.add('show');
}

// Show login loading
function showLoginLoading(loading) {
  loginBtnText.style.display = loading ? 'none' : 'inline';
  loginSpinner.style.display = loading ? 'inline-block' : 'none';
}

// Handle logout
function handleLogout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  currentUser = null;
  showLoginScreen();
  loginForm.reset();
}

// Navigate to page
function navigateTo(page) {
  currentPage = page;
  
  // Update navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.page === page) {
      item.classList.add('active');
    }
  });
  
  // Update page title
  const titles = {
    'dashboard': 'Dashboard',
    'applications': 'Arizalar',
    'students': 'O\'quvchilar',
    'communications': 'Aloqa',
    'tasks': 'Vazifalar',
    'payments': 'To\'lovlar',
    'reports': 'Hisobotlar',
    'settings': 'Sozlamalar'
  };
  document.getElementById('pageTitle').textContent = titles[page] || page;
  
  // Show page
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const pageElement = document.getElementById(page + 'Page');
  if (pageElement) {
    pageElement.classList.add('active');
  }
  
  // Load page data
  switch (page) {
    case 'dashboard':
      loadDashboard();
      break;
    case 'applications':
      loadApplications();
      break;
    case 'students':
      loadStudents();
      break;
    case 'communications':
      loadCommunications();
      break;
    case 'tasks':
      loadTasks();
      break;
    case 'payments':
      loadPayments();
      break;
    case 'settings':
      loadSettings();
      break;
  }
  
  // Close sidebar on mobile
  if (window.innerWidth <= 1024) {
    document.querySelector('.sidebar').classList.remove('open');
  }
}

// Toggle sidebar
function toggleSidebar() {
  document.querySelector('.sidebar').classList.toggle('open');
}

// Refresh current page
function refreshCurrentPage() {
  navigateTo(currentPage);
}

// Handle global search
function handleGlobalSearch(e) {
  const query = e.target.value.trim();
  if (query.length >= 2) {
    // Implement global search
    console.log('Searching for:', query);
  }
}

// Load dashboard
async function loadDashboard() {
  try {
    // Load statistics
    const { data: stats } = await supabase
      .from('application_stats')
      .select('*')
      .single();
    
    if (stats) {
      document.getElementById('totalApplications').textContent = stats.total_applications || 0;
      document.getElementById('enrolledStudents').textContent = stats.enrolled || 0;
      document.getElementById('pendingContacts').textContent = stats.new_applications || 0;
      document.getElementById('todayApplications').innerHTML = `<i class="fas fa-arrow-up"></i> +${stats.today_applications || 0} bugun`;
      
      const enrollmentRate = stats.total_applications > 0 
        ? Math.round((stats.enrolled / stats.total_applications) * 100) 
        : 0;
      document.getElementById('enrollmentRate').innerHTML = `<i class="fas fa-percentage"></i> ${enrollmentRate}%`;
    }
    
    // Load recent applications
    const { data: recentApps } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    renderRecentApplications(recentApps || []);
    
    // Load upcoming tasks
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*, applications(full_name)')
      .eq('status', 'pending')
      .order('due_date', { ascending: true })
      .limit(5);
    
    renderUpcomingTasks(tasks || []);
    
    // Load charts
    loadCharts();
    
    // Update badges
    updateBadges();
    
  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
}

// Render recent applications
function renderRecentApplications(applications) {
  const tbody = document.getElementById('recentApplicationsTable');
  
  if (applications.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">Arizalar yo\'q</td></tr>';
    return;
  }
  
  tbody.innerHTML = applications.map(app => `
    <tr>
      <td>${app.full_name}</td>
      <td>${app.phone}</td>
      <td><span class="status-badge ${app.status}">${getStatusName(app.status)}</span></td>
      <td>${formatDate(app.created_at)}</td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="viewApplication('${app.id}')">
          <i class="fas fa-eye"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

// Render upcoming tasks
function renderUpcomingTasks(tasks) {
  const container = document.getElementById('upcomingTasks');
  
  if (tasks.length === 0) {
    container.innerHTML = '<div class="task-item"><div class="task-info"><div class="task-title">Vazifalar yo\'q</div></div></div>';
    return;
  }
  
  container.innerHTML = tasks.map(task => `
    <div class="task-item">
      <div class="task-info">
        <div class="task-title">${task.title}</div>
        <div class="task-meta">
          <span><i class="fas fa-calendar"></i> ${formatDate(task.due_date)}</span>
          <span class="task-priority ${task.priority}">${getPriorityName(task.priority)}</span>
        </div>
      </div>
      <button class="btn btn-sm btn-outline" onclick="completeTask('${task.id}')">
        <i class="fas fa-check"></i>
      </button>
    </div>
  `).join('');
}

// Load charts
async function loadCharts() {
  try {
    const period = document.getElementById('chartPeriod')?.value || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));
    
    // Load applications over time
    const { data: timeData } = await supabase
      .from('applications')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });
    
    renderApplicationsChart(timeData || []);
    
    // Load status distribution
    const { data: statusData } = await supabase
      .from('applications')
      .select('status');
    
    renderStatusChart(statusData || []);
    
  } catch (error) {
    console.error('Error loading charts:', error);
  }
}

// Render applications chart
function renderApplicationsChart(data) {
  const ctx = document.getElementById('applicationsChart');
  if (!ctx) return;
  
  // Group by date
  const grouped = {};
  data.forEach(item => {
    const date = formatDate(item.created_at);
    grouped[date] = (grouped[date] || 0) + 1;
  });
  
  const labels = Object.keys(grouped);
  const values = Object.values(grouped);
  
  if (applicationsChart) {
    applicationsChart.destroy();
  }
  
  applicationsChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Arizalar',
        data: values,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#94a3b8'
          },
          grid: {
            color: '#334155'
          }
        },
        x: {
          ticks: {
            color: '#94a3b8'
          },
          grid: {
            color: '#334155'
          }
        }
      }
    }
  });
}

// Render status chart
function renderStatusChart(data) {
  const ctx = document.getElementById('statusChart');
  if (!ctx) return;
  
  // Group by status
  const grouped = {};
  data.forEach(item => {
    grouped[item.status] = (grouped[item.status] || 0) + 1;
  });
  
  const labels = Object.keys(grouped).map(s => getStatusName(s));
  const values = Object.values(grouped);
  const colors = ['#3b82f6', '#06b6d4', '#f59e0b', '#8b5cf6', '#10b981', '#ef4444', '#10b981', '#94a3b8'];
  
  if (statusChart) {
    statusChart.destroy();
  }
  
  statusChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: colors.slice(0, labels.length)
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#94a3b8'
          }
        }
      }
    }
  });
}

// Load applications
async function loadApplications() {
  try {
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    const trackFilter = document.getElementById('trackFilter')?.value || '';
    const searchQuery = document.getElementById('applicationSearch')?.value || '';
    
    let query = supabase.from('applications').select('*');
    
    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }
    
    if (trackFilter) {
      query = query.eq('preferred_it_track', trackFilter);
    }
    
    if (searchQuery) {
      query = query.or(`full_name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    renderApplications(data || []);
    
  } catch (error) {
    console.error('Error loading applications:', error);
  }
}

// Render applications
function renderApplications(applications) {
  const tbody = document.getElementById('applicationsTable');
  
  if (applications.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center">Arizalar topilmadi</td></tr>';
    return;
  }
  
  tbody.innerHTML = applications.map(app => `
    <tr>
      <td><input type="checkbox" class="app-checkbox" data-id="${app.id}"></td>
      <td>${app.full_name}</td>
      <td>${app.phone}</td>
      <td>${getTrackName(app.preferred_it_track)}</td>
      <td><span class="status-badge ${app.status}">${getStatusName(app.status)}</span></td>
      <td>${app.assigned_to ? 'Masul' : '-'}</td>
      <td>${formatDate(app.created_at)}</td>
      <td>
        <div class="btn-group">
          <button class="btn btn-sm btn-outline" onclick="viewApplication('${app.id}')" title="Ko'rish">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn btn-sm btn-outline" onclick="editApplication('${app.id}')" title="Tahrirlash">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-outline" onclick="deleteApplication('${app.id}')" title="O'chirish">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Load students
async function loadStudents() {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('status', 'enrolled')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    renderStudents(data || []);
    
  } catch (error) {
    console.error('Error loading students:', error);
  }
}

// Render students
function renderStudents(students) {
  const tbody = document.getElementById('studentsTable');
  
  if (students.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">O\'quvchilar yo\'q</td></tr>';
    return;
  }
  
  tbody.innerHTML = students.map(student => `
    <tr>
      <td>${student.full_name}</td>
      <td>${student.grade_level}-sinf</td>
      <td>${student.phone}</td>
      <td>${getTrackName(student.preferred_it_track)}</td>
      <td>${getAccommodationName(student.accommodation_type)}</td>
      <td><span class="status-badge enrolled">Faol</span></td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="viewStudent('${student.id}')">
          <i class="fas fa-eye"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

// Load communications
async function loadCommunications() {
  try {
    const typeFilter = document.getElementById('commTypeFilter')?.value || '';
    const directionFilter = document.getElementById('commDirectionFilter')?.value || '';
    
    let query = supabase
      .from('communications')
      .select('*, applications(full_name, phone)')
      .order('created_at', { ascending: false });
    
    if (typeFilter) {
      query = query.eq('type', typeFilter);
    }
    
    if (directionFilter) {
      query = query.eq('direction', directionFilter);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    renderCommunications(data || []);
    
  } catch (error) {
    console.error('Error loading communications:', error);
  }
}

// Render communications
function renderCommunications(communications) {
  const tbody = document.getElementById('communicationsTable');
  
  if (communications.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">Aloqalar yo\'q</td></tr>';
    return;
  }
  
  tbody.innerHTML = communications.map(comm => `
    <tr>
      <td><span class="comm-type ${comm.type}">${getCommTypeName(comm.type)}</span></td>
      <td><span class="comm-direction ${comm.direction}">${comm.direction === 'inbound' ? 'Kiruvchi' : 'Chiquvchi'}</span></td>
      <td>${comm.applications?.full_name || '-'}</td>
      <td>${comm.subject || '-'}</td>
      <td>${comm.outcome || '-'}</td>
      <td>${formatDate(comm.created_at)}</td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="viewCommunication('${comm.id}')">
          <i class="fas fa-eye"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

// Load tasks
async function loadTasks() {
  try {
    const statusFilter = document.getElementById('taskStatusFilter')?.value || '';
    const priorityFilter = document.getElementById('taskPriorityFilter')?.value || '';
    
    let query = supabase
      .from('tasks')
      .select('*, applications(full_name)')
      .order('due_date', { ascending: true });
    
    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }
    
    if (priorityFilter) {
      query = query.eq('priority', priorityFilter);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    renderTasks(data || []);
    
  } catch (error) {
    console.error('Error loading tasks:', error);
  }
}

// Render tasks
function renderTasks(tasks) {
  const container = document.getElementById('tasksGrid');
  
  if (tasks.length === 0) {
    container.innerHTML = '<div class="task-card"><p class="text-center">Vazifalar yo\'q</p></div>';
    return;
  }
  
  container.innerHTML = tasks.map(task => `
    <div class="task-card">
      <div class="task-header">
        <span class="task-priority ${task.priority}">${getPriorityName(task.priority)}</span>
        <span class="task-status ${task.status}">${getTaskStatusName(task.status)}</span>
      </div>
      <h4 class="task-title">${task.title}</h4>
      <p class="task-description">${task.description || ''}</p>
      <div class="task-meta">
        <span><i class="fas fa-calendar"></i> ${formatDate(task.due_date)}</span>
        <span><i class="fas fa-user"></i> ${task.applications?.full_name || '-'}</span>
      </div>
      <div class="task-actions" style="margin-top: 12px; display: flex; gap: 8px;">
        <button class="btn btn-sm btn-outline" onclick="editTask('${task.id}')">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-outline" onclick="completeTask('${task.id}')">
          <i class="fas fa-check"></i>
        </button>
      </div>
    </div>
  `).join('');
}

// Load payments
async function loadPayments() {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*, applications(full_name)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    renderPayments(data || []);
    updatePaymentSummary(data || []);
    
  } catch (error) {
    console.error('Error loading payments:', error);
  }
}

// Render payments
function renderPayments(payments) {
  const tbody = document.getElementById('paymentsTable');
  
  if (payments.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">To\'lovlar yo\'q</td></tr>';
    return;
  }
  
  tbody.innerHTML = payments.map(payment => `
    <tr>
      <td>${payment.receipt_number || '-'}</td>
      <td>${payment.applications?.full_name || '-'}</td>
      <td>${formatCurrency(payment.amount)}</td>
      <td>${getPaymentMethodName(payment.payment_method)}</td>
      <td><span class="status-badge ${payment.status}">${getPaymentStatusName(payment.status)}</span></td>
      <td>${formatDate(payment.payment_date)}</td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="viewPayment('${payment.id}')">
          <i class="fas fa-eye"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

// Update payment summary
function updatePaymentSummary(payments) {
  const total = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const today = new Date().toDateString();
  const todayTotal = payments
    .filter(p => new Date(p.payment_date).toDateString() === today)
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingTotal = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  
  document.getElementById('totalPayments').textContent = formatCurrency(total);
  document.getElementById('todayPayments').textContent = formatCurrency(todayTotal);
  document.getElementById('pendingPayments').textContent = formatCurrency(pendingTotal);
}

// Load settings
async function loadSettings() {
  try {
    const { data: settings } = await supabase.from('settings').select('*');
    
    if (settings) {
      settings.forEach(setting => {
        const element = document.getElementById(setting.key);
        if (element) {
          element.value = setting.value;
        }
      });
    }
    
    // Load users
    loadUsers();
    
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

// Load users
async function loadUsers() {
  try {
    const { data: users } = await supabase.from('users').select('*');
    
    const container = document.getElementById('usersList');
    if (container && users) {
      container.innerHTML = users.map(user => `
        <div class="user-item">
          <div class="user-avatar">
            <i class="fas fa-user"></i>
          </div>
          <div class="user-info">
            <div class="user-name">${user.full_name}</div>
            <div class="user-email">${user.email}</div>
            <span class="user-role-badge ${user.role}">${getRoleName(user.role)}</span>
          </div>
          <div class="user-actions">
            <button class="btn btn-sm btn-outline" onclick="editUser('${user.id}')">Tahrirlash</button>
          </div>
        </div>
      `).join('');
    }
    
    // Update assignee dropdowns
    updateAssigneeDropdowns(users || []);
    
  } catch (error) {
    console.error('Error loading users:', error);
  }
}

// Update assignee dropdowns
function updateAssigneeDropdowns(users) {
  const dropdowns = ['appAssignedTo', 'taskAssignedTo'];
  dropdowns.forEach(id => {
    const select = document.getElementById(id);
    if (select) {
      select.innerHTML = '<option value="">Tanlang</option>' + 
        users.map(u => `<option value="${u.id}">${u.full_name}</option>`).join('');
    }
  });
}

// Update badges
async function updateBadges() {
  try {
    // Applications badge
    const { count: newApps } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'new');
    
    const appsBadge = document.getElementById('applicationsBadge');
    if (appsBadge && newApps > 0) {
      appsBadge.textContent = newApps;
      appsBadge.classList.add('show');
    }
    
    // Tasks badge
    const { count: pendingTasks } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    
    const tasksBadge = document.getElementById('tasksBadge');
    if (tasksBadge && pendingTasks > 0) {
      tasksBadge.textContent = pendingTasks;
      tasksBadge.classList.add('show');
    }
    
  } catch (error) {
    console.error('Error updating badges:', error);
  }
}

// Application Modal
function openApplicationModal(applicationId = null) {
  const modal = document.getElementById('applicationModal');
  const title = document.getElementById('applicationModalTitle');
  const form = document.getElementById('applicationForm');
  
  form.reset();
  document.getElementById('applicationId').value = '';
  
  if (applicationId) {
    title.textContent = 'Arizani tahrirlash';
    // Load application data
    loadApplicationData(applicationId);
  } else {
    title.textContent = 'Yangi ariza';
  }
  
  modal.classList.add('show');
}

function closeApplicationModal() {
  document.getElementById('applicationModal').classList.remove('show');
}

async function loadApplicationData(applicationId) {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('id', applicationId)
      .single();
    
    if (error) throw error;
    
    if (data) {
      document.getElementById('applicationId').value = data.id;
      document.getElementById('appFullName').value = data.full_name || '';
      document.getElementById('appPhone').value = data.phone || '';
      document.getElementById('appParentName').value = data.parent_name || '';
      document.getElementById('appParentPhone').value = data.parent_phone || '';
      document.getElementById('appBirthDate').value = data.birth_date || '';
      document.getElementById('appGender').value = data.gender || '';
      document.getElementById('appAddress').value = data.address || '';
      document.getElementById('appPreviousSchool').value = data.previous_school || '';
      document.getElementById('appGradeLevel').value = data.grade_level || '';
      document.getElementById('appITTrack').value = data.preferred_it_track || '';
      document.getElementById('appAccommodation').value = data.accommodation_type || 'day';
      document.getElementById('appStatus').value = data.status || 'new';
      document.getElementById('appAssignedTo').value = data.assigned_to || '';
      document.getElementById('appNotes').value = data.notes || '';
    }
    
  } catch (error) {
    console.error('Error loading application:', error);
    showToast('Xatolik yuz berdi', 'error');
  }
}

async function handleApplicationSubmit(e) {
  e.preventDefault();
  
  const applicationId = document.getElementById('applicationId').value;
  const applicationData = {
    full_name: document.getElementById('appFullName').value,
    phone: document.getElementById('appPhone').value,
    parent_name: document.getElementById('appParentName').value,
    parent_phone: document.getElementById('appParentPhone').value,
    birth_date: document.getElementById('appBirthDate').value,
    gender: document.getElementById('appGender').value,
    address: document.getElementById('appAddress').value,
    previous_school: document.getElementById('appPreviousSchool').value,
    grade_level: document.getElementById('appGradeLevel').value,
    preferred_it_track: document.getElementById('appITTrack').value,
    accommodation_type: document.getElementById('appAccommodation').value,
    status: document.getElementById('appStatus').value,
    assigned_to: document.getElementById('appAssignedTo').value,
    notes: document.getElementById('appNotes').value
  };
  
  try {
    let error;
    
    if (applicationId) {
      const result = await supabase
        .from('applications')
        .update(applicationData)
        .eq('id', applicationId);
      error = result.error;
    } else {
      const result = await supabase
        .from('applications')
        .insert([applicationData]);
      error = result.error;
    }
    
    if (error) throw error;
    
    showToast(applicationId ? 'Ariza yangilandi' : 'Ariza yaratildi');
    closeApplicationModal();
    loadApplications();
    
  } catch (error) {
    console.error('Error saving application:', error);
    showToast('Xatolik yuz berdi', 'error');
  }
}

// Communication Modal
function openCommunicationModal() {
  const modal = document.getElementById('communicationModal');
  const form = document.getElementById('communicationForm');
  
  form.reset();
  
  // Load applications dropdown
  loadApplicationsDropdown();
  
  modal.classList.add('show');
}

function closeCommunicationModal() {
  document.getElementById('communicationModal').classList.remove('show');
}

async function loadApplicationsDropdown() {
  try {
    const { data } = await supabase
      .from('applications')
      .select('id, full_name')
      .order('created_at', { ascending: false });
    
    const select = document.getElementById('commApplication');
    if (select && data) {
      select.innerHTML = '<option value="">Tanlang</option>' + 
        data.map(a => `<option value="${a.id}">${a.full_name}</option>`).join('');
    }
    
  } catch (error) {
    console.error('Error loading applications:', error);
  }
}

async function handleCommunicationSubmit(e) {
  e.preventDefault();
  
  const communicationData = {
    application_id: document.getElementById('commApplication').value,
    type: document.getElementById('commType').value,
    direction: document.getElementById('commDirection').value,
    duration_minutes: document.getElementById('commDuration').value,
    subject: document.getElementById('commSubject').value,
    content: document.getElementById('commContent').value,
    outcome: document.getElementById('commOutcome').value,
    next_follow_up: document.getElementById('commNextFollowUp').value,
    created_by: currentUser.id
  };
  
  try {
    const { error } = await supabase
      .from('communications')
      .insert([communicationData]);
    
    if (error) throw error;
    
    showToast('Aloqa qo\'shildi');
    closeCommunicationModal();
    loadCommunications();
    
  } catch (error) {
    console.error('Error saving communication:', error);
    showToast('Xatolik yuz berdi', 'error');
  }
}

// Task Modal
function openTaskModal(taskId = null) {
  const modal = document.getElementById('taskModal');
  const title = document.getElementById('taskModalTitle');
  const form = document.getElementById('taskForm');
  
  form.reset();
  document.getElementById('taskId').value = '';
  
  // Load applications dropdown
  loadTaskApplicationsDropdown();
  
  if (taskId) {
    title.textContent = 'Vazifani tahrirlash';
    loadTaskData(taskId);
  } else {
    title.textContent = 'Yangi vazifa';
  }
  
  modal.classList.add('show');
}

function closeTaskModal() {
  document.getElementById('taskModal').classList.remove('show');
}

async function loadTaskApplicationsDropdown() {
  try {
    const { data } = await supabase
      .from('applications')
      .select('id, full_name')
      .order('created_at', { ascending: false });
    
    const select = document.getElementById('taskApplication');
    if (select && data) {
      select.innerHTML = '<option value="">Tanlang (ixtiyoriy)</option>' + 
        data.map(a => `<option value="${a.id}">${a.full_name}</option>`).join('');
    }
    
  } catch (error) {
    console.error('Error loading applications:', error);
  }
}

async function loadTaskData(taskId) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();
    
    if (error) throw error;
    
    if (data) {
      document.getElementById('taskId').value = data.id;
      document.getElementById('taskTitle').value = data.title || '';
      document.getElementById('taskDescription').value = data.description || '';
      document.getElementById('taskApplication').value = data.application_id || '';
      document.getElementById('taskAssignedTo').value = data.assigned_to || '';
      document.getElementById('taskPriority').value = data.priority || 'medium';
      document.getElementById('taskDueDate').value = data.due_date || '';
      document.getElementById('taskStatus').value = data.status || 'pending';
    }
    
  } catch (error) {
    console.error('Error loading task:', error);
  }
}

async function handleTaskSubmit(e) {
  e.preventDefault();
  
  const taskId = document.getElementById('taskId').value;
  const taskData = {
    title: document.getElementById('taskTitle').value,
    description: document.getElementById('taskDescription').value,
    application_id: document.getElementById('taskApplication').value,
    assigned_to: document.getElementById('taskAssignedTo').value,
    priority: document.getElementById('taskPriority').value,
    due_date: document.getElementById('taskDueDate').value,
    status: document.getElementById('taskStatus').value
  };
  
  try {
    let error;
    
    if (taskId) {
      const result = await supabase
        .from('tasks')
        .update(taskData)
        .eq('id', taskId);
      error = result.error;
    } else {
      const result = await supabase
        .from('tasks')
        .insert([taskData]);
      error = result.error;
    }
    
    if (error) throw error;
    
    showToast(taskId ? 'Vazifa yangilandi' : 'Vazifa yaratildi');
    closeTaskModal();
    loadTasks();
    
  } catch (error) {
    console.error('Error saving task:', error);
    showToast('Xatolik yuz berdi', 'error');
  }
}

async function completeTask(taskId) {
  try {
    const { error } = await supabase
      .from('tasks')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', taskId);
    
    if (error) throw error;
    
    showToast('Vazifa bajarildi');
    loadTasks();
    
  } catch (error) {
    console.error('Error completing task:', error);
    showToast('Xatolik yuz berdi', 'error');
  }
}

// Payment Modal
function openPaymentModal() {
  const modal = document.getElementById('paymentModal');
  const form = document.getElementById('paymentForm');
  
  form.reset();
  document.getElementById('paymentDate').value = new Date().toISOString().split('T')[0];
  
  // Load enrolled students dropdown
  loadPaymentApplicationsDropdown();
  
  modal.classList.add('show');
}

function closePaymentModal() {
  document.getElementById('paymentModal').classList.remove('show');
}

async function loadPaymentApplicationsDropdown() {
  try {
    const { data } = await supabase
      .from('applications')
      .select('id, full_name')
      .eq('status', 'enrolled')
      .order('full_name');
    
    const select = document.getElementById('paymentApplication');
    if (select && data) {
      select.innerHTML = '<option value="">Tanlang</option>' + 
        data.map(a => `<option value="${a.id}">${a.full_name}</option>`).join('');
    }
    
  } catch (error) {
    console.error('Error loading applications:', error);
  }
}

async function handlePaymentSubmit(e) {
  e.preventDefault();
  
  const paymentData = {
    application_id: document.getElementById('paymentApplication').value,
    amount: parseFloat(document.getElementById('paymentAmount').value),
    payment_method: document.getElementById('paymentMethod').value,
    payment_date: document.getElementById('paymentDate').value,
    status: document.getElementById('paymentStatus').value,
    receipt_number: document.getElementById('paymentReceipt').value,
    description: document.getElementById('paymentDescription').value
  };
  
  try {
    const { error } = await supabase
      .from('payments')
      .insert([paymentData]);
    
    if (error) throw error;
    
    showToast('To\'lov qo\'shildi');
    closePaymentModal();
    loadPayments();
    
  } catch (error) {
    console.error('Error saving payment:', error);
    showToast('Xatolik yuz berdi', 'error');
  }
}

// User Modal
function openUserModal() {
  const modal = document.getElementById('userModal');
  const form = document.getElementById('userForm');
  
  form.reset();
  
  modal.classList.add('show');
}

function closeUserModal() {
  document.getElementById('userModal').classList.remove('show');
}

async function handleUserSubmit(e) {
  e.preventDefault();
  
  const userData = {
    full_name: document.getElementById('userFullName').value,
    email: document.getElementById('userEmail').value,
    password_hash: document.getElementById('userPassword').value,
    role: document.getElementById('userRole').value
  };
  
  try {
    const { error } = await supabase
      .from('users')
      .insert([userData]);
    
    if (error) throw error;
    
    showToast('Foydalanuvchi qo\'shildi');
    closeUserModal();
    loadUsers();
    
  } catch (error) {
    console.error('Error saving user:', error);
    showToast('Xatolik yuz berdi', 'error');
  }
}

// School settings
async function handleSchoolSettings(e) {
  e.preventDefault();
  
  const settings = [
    { key: 'school_name', value: document.getElementById('schoolName').value },
    { key: 'school_phone', value: document.getElementById('schoolPhone').value },
    { key: 'school_address', value: document.getElementById('schoolAddress').value },
    { key: 'school_year', value: document.getElementById('schoolYear').value },
    { key: 'max_students', value: document.getElementById('maxStudents').value }
  ];
  
  try {
    for (const setting of settings) {
      await supabase
        .from('settings')
        .upsert({ ...setting, updated_at: new Date().toISOString() });
    }
    
    showToast('Sozlamalar saqlandi');
    
  } catch (error) {
    console.error('Error saving settings:', error);
    showToast('Xatolik yuz berdi', 'error');
  }
}

// View functions
function viewApplication(id) {
  openApplicationModal(id);
}

function editApplication(id) {
  openApplicationModal(id);
}

async function deleteApplication(id) {
  if (!confirm('Arizani o\'chirmoqchimisiz?')) return;
  
  try {
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    showToast('Ariza o\'chirildi');
    loadApplications();
    
  } catch (error) {
    console.error('Error deleting application:', error);
    showToast('Xatolik yuz berdi', 'error');
  }
}

function editTask(id) {
  openTaskModal(id);
}

// Report generation
function generateReport(type) {
  showToast('Hisobot yuklanmoqda...');
  
  // In production, generate actual reports
  setTimeout(() => {
    showToast('Hisobot yuklab olindi');
  }, 1000);
}

// Helper functions
function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('uz-UZ');
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m';
}

function getStatusName(status) {
  const names = {
    'new': 'Yangi',
    'contacted': 'Bog\'langan',
    'interview_scheduled': 'Suhbat rejalashtirilgan',
    'interviewed': 'Suhbat o\'tkazilgan',
    'approved': 'Tasdiqlangan',
    'rejected': 'Rad etilgan',
    'enrolled': 'Qabul qilingan',
    'waitlist': 'Kutish ro\'yxati'
  };
  return names[status] || status;
}

function getTrackName(track) {
  const names = {
    'python': 'Python',
    'web': 'Web dasturlash',
    'mobile': 'Mobil dasturlash',
    'design': 'UI/UX dizayn',
    'network': 'Tarmoq',
    'security': 'Kiberxavfsizlik'
  };
  return names[track] || track;
}

function getAccommodationName(type) {
  const names = {
    'day': 'Uydan',
    'transport': 'Transport',
    'dormitory': 'Yotoqxona'
  };
  return names[type] || type;
}

function getCommTypeName(type) {
  const names = {
    'call': 'Qo\'ng\'iroq',
    'sms': 'SMS',
    'email': 'Email',
    'whatsapp': 'WhatsApp',
    'meeting': 'Uchrashuv',
    'note': 'Eslatma'
  };
  return names[type] || type;
}

function getPriorityName(priority) {
  const names = {
    'low': 'Past',
    'medium': 'O\'rta',
    'high': 'Yuqori',
    'urgent': 'Shoshilinch'
  };
  return names[priority] || priority;
}

function getTaskStatusName(status) {
  const names = {
    'pending': 'Kutilmoqda',
    'in_progress': 'Bajarilmoqda',
    'completed': 'Bajarilgan',
    'cancelled': 'Bekor qilingan'
  };
  return names[status] || status;
}

function getPaymentMethodName(method) {
  const names = {
    'cash': 'Naqd',
    'card': 'Karta',
    'bank_transfer': 'Bank o\'tkazmasi',
    'click': 'Click',
    'payme': 'Payme'
  };
  return names[method] || method;
}

function getPaymentStatusName(status) {
  const names = {
    'pending': 'Kutilmoqda',
    'completed': 'To\'langan',
    'failed': 'Xato',
    'refunded': 'Qaytarilgan'
  };
  return names[status] || status;
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastMessage = toast.querySelector('.toast-message');
  const toastIcon = toast.querySelector('.toast-icon');
  
  toastMessage.textContent = message;
  
  if (type === 'error') {
    toastIcon.style.background = 'var(--danger)';
    toastIcon.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
  } else {
    toastIcon.style.background = 'var(--success)';
    toastIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
  }
  
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Pagination (simplified)
let currentPageNum = 1;
const itemsPerPage = 10;

function changePage(direction) {
  currentPageNum += direction;
  // Implement pagination logic
  console.log('Page:', currentPageNum);
}
