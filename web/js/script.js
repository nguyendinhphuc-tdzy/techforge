// --- 1. CONFIG & DATA INITIALIZATION ---
const USERS = {
    'vegeta': { pass: '123', role: 'manager', name: 'Vegeta (CEO)', avatar: 'assets/vegeta.png', email: 'vegeta@saiyan.com', rate: 100, skills: {'Leadership': 'Expert'} },
    'goku': { pass: '123', role: 'employee', name: 'Goku (Dev)', avatar: 'assets/goku.png', email: 'goku@saiyan.com', rate: 50, skills: {'Java': 'Expert', 'Combat': 'God'} },
    'bulma': { pass: '123', role: 'admin', name: 'Bulma (CFO)', avatar: 'assets/bulma.png', email: 'bulma@capsule.corp', rate: 200, skills: {'Finance': 'Expert'} },
    'frieza': { pass: '123', role: 'client', name: 'Frieza (Client)', avatar: 'assets/frieza.png', email: 'frieza@empire.com', rate: 0, skills: {} }
};

// Khởi tạo dữ liệu mẫu nếu chưa có
function initDB() {
    if (!localStorage.getItem('techForgeTasks')) {
        const defaultTasks = [
            { id: 'T-101', name: 'DB Schema Design', status: 'todo', priority: 'high' },
            { id: 'T-105', name: 'API Auth Module', status: 'doing', priority: 'high' },
            { id: 'T-099', name: 'Req Gathering', status: 'done', priority: 'low' }
        ];
        localStorage.setItem('techForgeTasks', JSON.stringify(defaultTasks));
    }
    if (!localStorage.getItem('techForgePayroll')) {
        localStorage.setItem('techForgePayroll', JSON.stringify([]));
    }
    if (!localStorage.getItem('techForgeProjects')) {
        const defaultProjects = [
            { name: "E-Commerce Super App", client: "Bulma Corp", budget: 15000, deadline: "2025-12-30", status: "Planning" },
            { name: "HR System V2", client: "Red Ribbon", budget: 8500, deadline: "2026-01-15", status: "Running" }
        ];
        localStorage.setItem('techForgeProjects', JSON.stringify(defaultProjects));
    }
}
initDB();

// --- 2. AUTHENTICATION ---
function handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('username').value.toLowerCase().trim();
    const pass = document.getElementById('password').value;

    if (USERS[user] && USERS[user].pass === pass) {
        localStorage.setItem('currentUser', user);
        document.getElementById('loginView').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('loginView').style.display = 'none';
            document.getElementById('appView').style.display = 'block';
            loadUserWorkspace();
        }, 500);
    } else {
        const errorMsg = document.getElementById('loginError');
        errorMsg.style.display = 'block';
        document.getElementById('loginCard').classList.add('shake');
        setTimeout(() => document.getElementById('loginCard').classList.remove('shake'), 500);
    }
}

function loadUserWorkspace() {
    const userKey = localStorage.getItem('currentUser');
    if(!userKey || !USERS[userKey]) { logout(); return; }

    const userData = USERS[userKey];
    document.getElementById('currentUser').innerText = userData.name;

    const avatarEl = document.getElementById('userAvatar');
    avatarEl.src = userData.avatar;
    avatarEl.onerror = function() { this.src = 'https://via.placeholder.com/40'; };

    // Ẩn tất cả nav item
    document.querySelectorAll('.nav-item').forEach(el => el.style.display = 'none');

    // Hiển thị nav item theo role và load view tương ứng
    if (userData.role === 'manager') {
        document.getElementById('nav-manager').style.display = 'flex';
        switchView('manager', document.getElementById('nav-manager'));
    } else if (userData.role === 'employee') {
        document.getElementById('nav-employee').style.display = 'flex';
        switchView('employee', document.getElementById('nav-employee'));
    } else if (userData.role === 'admin') {
        document.getElementById('nav-admin').style.display = 'flex';
        switchView('admin', document.getElementById('nav-admin'));
    } else if (userData.role === 'client') {
        document.getElementById('nav-client').style.display = 'flex';
        switchView('client', document.getElementById('nav-client'));
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    location.reload();
}

// --- 3. CORE LOGIC & SYNC ---

// Hàm chuyển View và Render lại dữ liệu mới nhất
function switchView(viewId, element) {
    document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    document.getElementById(viewId).classList.add('active');
    if(element) element.classList.add('active');

    // Tự động tải lại dữ liệu khi chuyển tab
    if(viewId === 'manager') renderProjects();
    if(viewId === 'employee') renderKanban();
    if(viewId === 'admin') renderPayroll();
    if(viewId === 'client') setTimeout(renderClientDashboard, 100);
}

// *** MAGIC SYNC: Lắng nghe thay đổi từ các tab khác ***
window.addEventListener('storage', (event) => {
    // Nếu dữ liệu Tasks, Payroll hoặc Projects thay đổi -> Render lại giao diện ngay lập tức
    const currentView = document.querySelector('.view.active').id;
    if (currentView === 'manager') renderProjects();
    if (currentView === 'employee') renderKanban();
    if (currentView === 'admin') renderPayroll();
    if (currentView === 'client') renderClientDashboard();
});

// --- 4. FEATURE: MANAGER (PROJECTS) ---
function renderProjects() {
    const projects = JSON.parse(localStorage.getItem('techForgeProjects')) || [];
    const tbody = document.getElementById('projectTableBody');
    tbody.innerHTML = '';

    projects.forEach(p => {
        const badgeClass = p.status === 'Planning' ? 'status-planning' : 'status-active';
        const row = `<tr>
            <td><strong>${p.name}</strong></td>
            <td>${p.client}</td>
            <td>$${parseInt(p.budget).toLocaleString()}</td>
            <td>${p.deadline}</td>
            <td><span class="status-badge ${badgeClass}">${p.status}</span></td>
            <td><button class="btn btn-outline" style="padding: 5px 10px; font-size: 0.7rem;" onclick="openModal('assignTaskModal')">Manage</button></td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

function saveProject() {
    const name = document.getElementById('projName').value;
    const budget = document.getElementById('projBudget').value;
    const deadline = document.getElementById('projDeadline').value;

    if(!name || !budget) return alert("Missing info!");

    const projects = JSON.parse(localStorage.getItem('techForgeProjects')) || [];
    projects.push({ name, client: "New Client", budget, deadline, status: "Planning" });
    localStorage.setItem('techForgeProjects', JSON.stringify(projects));

    renderProjects();
    closeModal('createProjectModal');
    // Sinh ra task mặc định cho project mới
    const tasks = JSON.parse(localStorage.getItem('techForgeTasks')) || [];
    tasks.push({ id: `T-${Date.now()}`, name: "Setup Env for " + name, status: 'todo', priority: 'high' });
    localStorage.setItem('techForgeTasks', JSON.stringify(tasks));
}

// --- 5. FEATURE: EMPLOYEE (KANBAN) ---
function renderKanban() {
    const tasks = JSON.parse(localStorage.getItem('techForgeTasks')) || [];
    const cols = {
        'todo': document.getElementById('todo-list'),
        'doing': document.getElementById('doing-list'),
        'done': document.getElementById('done-list')
    };

    // Clear lists but keep headers
    Object.values(cols).forEach(col => {
        const header = col.querySelector('.kanban-header');
        col.innerHTML = '';
        col.appendChild(header);
    });

    const counts = { 'todo': 0, 'doing': 0, 'done': 0 };

    tasks.forEach(task => {
        if(cols[task.status]) {
            counts[task.status]++;
            const borderLeft = task.priority === 'high' ? 'var(--danger)' : 'var(--accent)';
            const card = document.createElement('div');
            card.className = `task-card priority-${task.priority}`;
            card.id = task.id;
            card.draggable = true;
            card.ondragstart = drag;
            card.style.borderLeftColor = borderLeft;

            card.innerHTML = `
                <div style="font-weight: 700; margin-bottom: 5px;">${task.name}</div>
                <div style="font-size: 0.85rem; color: var(--text-light); display: flex; justify-content: space-between;">
                    <span><i class="fas fa-hashtag"></i> ${task.id}</span>
                </div>`;
            cols[task.status].appendChild(card);
        }
    });

    // Update badges
    document.getElementById('count-todo').innerText = counts['todo'];
    document.getElementById('count-doing').innerText = counts['doing'];
    document.getElementById('count-done').innerText = counts['done'];
}

// Drag & Drop Logic
function allowDrop(ev) { ev.preventDefault(); ev.currentTarget.classList.add('drag-over'); }
function dragLeave(ev) { ev.currentTarget.classList.remove('drag-over'); }
function drag(ev) { ev.dataTransfer.setData("text", ev.target.id); ev.target.classList.add('dragging'); }
function drop(ev, newStatus) {
    ev.preventDefault();
    ev.currentTarget.classList.remove('drag-over');
    const taskId = ev.dataTransfer.getData("text");

    let tasks = JSON.parse(localStorage.getItem('techForgeTasks')) || [];
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if(taskIndex > -1) {
        tasks[taskIndex].status = newStatus;
        localStorage.setItem('techForgeTasks', JSON.stringify(tasks)); // Sync Trigger
        renderKanban();
    }
}

// --- 6. FEATURE: ADMIN (PAYROLL) ---
function saveLogTime() {
    const hours = parseFloat(document.getElementById('logHours').value);
    const userKey = localStorage.getItem('currentUser');
    const userObj = USERS[userKey];

    if(userObj) {
        let payroll = JSON.parse(localStorage.getItem('techForgePayroll')) || [];
        // Check pending record
        let entry = payroll.find(p => p.user === userKey && p.status === 'Pending');
        if(entry) {
            entry.hours += hours;
        } else {
            payroll.push({ user: userKey, role: userObj.role, hours: hours, rate: userObj.rate, status: 'Pending' });
        }
        localStorage.setItem('techForgePayroll', JSON.stringify(payroll)); // Sync Trigger
        alert("Time logged successfully!");
        closeModal('logTimeModal');
    }
}

function renderPayroll() {
    const payroll = JSON.parse(localStorage.getItem('techForgePayroll')) || [];
    const tbody = document.getElementById('payrollTableBody');
    if(!tbody) return;
    tbody.innerHTML = '';
    let totalPending = 0;

    payroll.forEach(p => {
        const amount = p.hours * p.rate;
        if(p.status === 'Pending') totalPending += amount;

        const badge = p.status === 'Pending'
            ? '<span style="color:var(--warning); font-weight:bold;">Pending</span>'
            : '<span style="color:var(--success); font-weight:bold;">Paid</span>';

        const userName = USERS[p.user] ? USERS[p.user].name : p.user;

        const row = `<tr>
            <td>${userName}</td>
            <td>${p.role.toUpperCase()}</td>
            <td>${p.hours}h</td>
            <td>$${amount.toLocaleString()}</td>
            <td>${badge}</td>
        </tr>`;
        tbody.innerHTML += row;
    });
    document.getElementById('totalPendingPayroll').innerText = '$' + totalPending.toLocaleString();
}

function processPayment() {
    let payroll = JSON.parse(localStorage.getItem('techForgePayroll')) || [];
    let paidSomething = false;
    payroll.forEach(p => {
        if(p.status === 'Pending') {
            p.status = 'Paid';
            paidSomething = true;
        }
    });
    if(paidSomething) {
        localStorage.setItem('techForgePayroll', JSON.stringify(payroll)); // Sync Trigger
        renderPayroll();
        alert("All pending payments processed via MoMo!");
    } else {
        alert("No pending payments!");
    }
    closeModal('momoModal');
}

// --- 7. FEATURE: CLIENT (DASHBOARD REAL-TIME) ---
let teamChart, ganttChart;

function renderClientDashboard() {
    const tasks = JSON.parse(localStorage.getItem('techForgeTasks')) || [];

    // Tính toán số liệu thật từ Tasks
    const todoCount = tasks.filter(t => t.status === 'todo').length;
    const doingCount = tasks.filter(t => t.status === 'doing').length;
    const doneCount = tasks.filter(t => t.status === 'done').length;
    const total = todoCount + doingCount + doneCount;

    // Vẽ lại biểu đồ Team Progress (Dựa trên trạng thái)
    const ctxTeam = document.getElementById('teamProgressChart').getContext('2d');
    if (teamChart) teamChart.destroy();

    teamChart = new Chart(ctxTeam, {
        type: 'bar',
        data: {
            labels: ['To Do', 'In Progress', 'Completed'],
            datasets: [{
                label: 'Task Volume',
                data: [todoCount, doingCount, doneCount],
                backgroundColor: ['#9CA3AF', '#F85B1A', '#10B981'],
                borderRadius: 5
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    // Vẽ lại Gantt Chart (Giả lập tiến độ dựa trên % hoàn thành)
    const completionRate = total === 0 ? 0 : Math.round((doneCount / total) * 100);
    const ctxGantt = document.getElementById('projectGanttChart').getContext('2d');
    if (ganttChart) ganttChart.destroy();

    ganttChart = new Chart(ctxGantt, {
        type: 'bar',
        data: {
            labels: ['Project Alpha'],
            datasets: [
                {
                    label: 'Target',
                    data: [100],
                    backgroundColor: 'rgba(200,200,200,0.3)',
                    borderWidth: 0,
                    barPercentage: 0.5
                },
                {
                    label: 'Actual Completion (%)',
                    data: [completionRate],
                    backgroundColor: completionRate < 50 ? '#DC2626' : (completionRate < 80 ? '#F7B32D' : '#10B981'),
                    barPercentage: 0.3
                }
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: { x: { max: 100 } }
        }
    });
}

// --- 8. UTILITIES (MODALS, TIMERS, ETC) ---
function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
window.onclick = function(e) { if(e.target.classList.contains('modal-overlay')) e.target.style.display = 'none'; }

function togglePassword() {
    const input = document.getElementById('password');
    const icon = document.querySelector('.toggle-password');
    input.type = input.type === "password" ? "text" : "password";
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
}

let timerInterval; let seconds = 0; let isRunning = false;
function toggleTimer() {
    const btn = document.getElementById('timerBtn');
    const display = document.getElementById('timerDisplay');
    if (!isRunning) {
        isRunning = true; btn.innerText = "Stop & Log"; btn.style.backgroundColor = "#DC2626"; btn.style.color = "white";
        timerInterval = setInterval(() => { seconds++; const date = new Date(0); date.setSeconds(seconds); display.innerText = date.toISOString().substr(11, 8); }, 1000);
    } else {
        clearInterval(timerInterval); isRunning = false;
        openModal('logTimeModal');
        let hours = (seconds / 3600).toFixed(2); if(hours == 0) hours = 0.1;
        document.getElementById('logHours').value = hours;
        btn.innerText = "Start"; btn.style.backgroundColor = ""; btn.style.color = ""; display.innerText = "00:00:00";
    }
}

function generateFinanceReport(btn) {
    btn.innerText = "Analyzing...";
    setTimeout(() => {
        document.getElementById('financeAiText').innerText = "AI Analysis: Efficiency is up 15%. Recommend approving pending payrolls.";
        btn.style.display = 'none';
    }, 1500);
}

function scanStaffAI() {
    const btn = document.querySelector('#scanBtnContainer button');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Scanning...';
    setTimeout(() => {
        document.getElementById('scanBtnContainer').style.display = 'none';
        document.getElementById('aiStaffResult').style.display = 'block';
        document.getElementById('assignActionBtns').style.display = 'block';
    }, 1000);
}

function confirmAssignment() {
    // Tạo task mới và lưu vào DB chung
    const taskName = "Design Database Schema";
    const tasks = JSON.parse(localStorage.getItem('techForgeTasks')) || [];
    tasks.push({ id: `T-${Date.now().toString().slice(-4)}`, name: taskName, status: 'todo', priority: 'med' });
    localStorage.setItem('techForgeTasks', JSON.stringify(tasks));

    alert("Task Assigned! Goku will see this immediately.");
    closeModal('assignTaskModal');
    // Không cần gọi render vì Event Listener 'storage' sẽ lo việc đó nếu mở tab khác,
    // hoặc dòng switchView sẽ lo nếu ở cùng tab.
    renderKanban();
}

function openProfileModal() {
    const userKey = localStorage.getItem('currentUser');
    const user = USERS[userKey];
    document.getElementById('profileAvatarPreview').src = user.avatar;
    document.getElementById('profileNameDisplay').innerText = user.name;
    document.getElementById('profileRoleDisplay').innerText = user.role.toUpperCase();
    document.getElementById('profileEmail').value = user.email;
    document.getElementById('profileRate').value = user.rate;

    const skillList = document.getElementById('skillList');
    skillList.innerHTML = '';
    for(const [s, l] of Object.entries(user.skills)) {
        skillList.innerHTML += `<div style="margin-bottom:5px;"><strong>${s}</strong>: ${l}</div>`;
    }
    openModal('profileModal');
}

function saveProfile() {
    const newRate = document.getElementById('profileRate').value;
    const userKey = localStorage.getItem('currentUser');
    if(USERS[userKey]) USERS[userKey].rate = newRate;
    alert("Profile Updated!");
    closeModal('profileModal');
}