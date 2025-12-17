// --- 1. CONFIG & DATA INITIALIZATION ---
const USERS = {
    'vegeta': { pass: '123', role: 'manager', name: 'Vegeta (CEO)', avatar: 'assets/vegeta.png', email: 'vegeta@saiyan.com', rate: 100, skills: {'Leadership': 'Expert'} },
    'goku': { pass: '123', role: 'employee', name: 'Goku (Dev)', avatar: 'assets/goku.png', email: 'goku@saiyan.com', rate: 50, skills: {'Java': 'Expert', 'Combat': 'God'} },
    'bulma': { pass: '123', role: 'admin', name: 'Bulma (CFO)', avatar: 'assets/bulma.png', email: 'bulma@capsule.corp', rate: 200, skills: {'Finance': 'Expert'} },
    'frieza': { pass: '123', role: 'client', name: 'Frieza (Client)', avatar: 'assets/frieza.png', email: 'frieza@empire.com', rate: 0, skills: {} }
};

// Khởi tạo dữ liệu
function initDB() {
    if (!localStorage.getItem('techForgeTasks')) {
        const now = new Date().toISOString();
        const defaultTasks = [
            { id: 'T-101', name: 'DB Schema Design', project: 'E-Commerce Super App', description: 'Design SQL tables for Users and Orders.', status: 'todo', priority: 'high', timestamp: now },
            { id: 'T-105', name: 'API Auth Module', project: 'E-Commerce Super App', description: 'Implement JWT Authentication.', status: 'doing', priority: 'high', timestamp: now }
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

    document.querySelectorAll('.nav-item').forEach(el => el.style.display = 'none');

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
function switchView(viewId, element) {
    document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    document.getElementById(viewId).classList.add('active');
    if(element) element.classList.add('active');

    if(viewId === 'manager') renderProjects();
    if(viewId === 'employee') renderKanban();
    if(viewId === 'admin') renderPayroll();
    if(viewId === 'client') setTimeout(renderClientDashboard, 100);
}

window.addEventListener('storage', (event) => {
    const currentView = document.querySelector('.view.active').id;
    if (currentView === 'manager') renderProjects();
    if (currentView === 'employee') renderKanban();
    if (currentView === 'admin') renderPayroll();
    if (currentView === 'client') renderClientDashboard();
});

// --- 4. FEATURE: MANAGER (PROJECTS & ASSIGNMENT) ---
function renderProjects() {
    const projects = JSON.parse(localStorage.getItem('techForgeProjects')) || [];
    const tbody = document.getElementById('projectTableBody');
    tbody.innerHTML = '';

    projects.forEach(p => {
        const badgeClass = p.status === 'Planning' ? 'status-planning' : 'status-active';
        // [UPDATE] Gọi prepareAssignment với tên Project
        const row = `<tr>
            <td><strong>${p.name}</strong></td>
            <td>${p.client}</td>
            <td>$${parseInt(p.budget).toLocaleString()}</td>
            <td>${p.deadline}</td>
            <td><span class="status-badge ${badgeClass}">${p.status}</span></td>
            <td><button class="btn btn-outline" style="padding: 5px 10px; font-size: 0.7rem;" onclick="prepareAssignment('${p.name}')">Manage</button></td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

// [NEW] Chuẩn bị modal gán việc cho project cụ thể
function prepareAssignment(projectName) {
    document.getElementById('assignProjectRef').value = projectName;
    document.getElementById('assignTaskInput').value = ""; // Clear cũ
    document.getElementById('assignTaskDesc').value = "";

    // Reset UI AI scan
    document.getElementById('scanBtnContainer').style.display = 'block';
    document.getElementById('aiStaffResult').style.display = 'none';
    document.getElementById('assignActionBtns').style.display = 'none';

    openModal('assignTaskModal');
}

function saveProject() {
    const name = document.getElementById('projName').value;
    const budget = document.getElementById('projBudget').value;
    const deadline = document.getElementById('projDeadline').value;
    const email = document.getElementById('clientEmail').value;

    if(!name || !budget || !deadline || !email) { alert("Please fill in all fields!"); return; }

    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
        alert("Invalid Email! Only @gmail.com is allowed.");
        return;
    }

    const projects = JSON.parse(localStorage.getItem('techForgeProjects')) || [];
    projects.push({ name, client: email, budget, deadline, status: "Planning" });
    localStorage.setItem('techForgeProjects', JSON.stringify(projects));

    // Auto create setup task
    const tasks = JSON.parse(localStorage.getItem('techForgeTasks')) || [];
    tasks.push({
        id: `T-${Date.now()}`,
        name: "Setup Env for " + name,
        project: name,
        description: "Initialize repository and server environment.",
        status: 'todo', priority: 'high', timestamp: new Date().toISOString()
    });
    localStorage.setItem('techForgeTasks', JSON.stringify(tasks));

    renderProjects();
    closeModal('createProjectModal');
    alert(`Project "${name}" created!`);
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

// [UPDATED] Gán việc với dữ liệu thật từ Input
function confirmAssignment() {
    const taskName = document.getElementById('assignTaskInput').value;
    const taskDesc = document.getElementById('assignTaskDesc').value;
    const projectName = document.getElementById('assignProjectRef').value;

    if(!taskName) {
        alert("Please enter a Task Name!");
        return;
    }

    const tasks = JSON.parse(localStorage.getItem('techForgeTasks')) || [];
    tasks.push({
        id: `T-${Date.now().toString().slice(-4)}`,
        name: taskName,
        project: projectName,
        description: taskDesc || "No description provided.",
        status: 'todo',
        priority: 'med',
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('techForgeTasks', JSON.stringify(tasks));

    alert(`Task "${taskName}" assigned to Goku for project "${projectName}"!`);
    closeModal('assignTaskModal');
    renderKanban();
}

// --- 5. FEATURE: EMPLOYEE (KANBAN & DETAILS) ---
function renderKanban() {
    const tasks = JSON.parse(localStorage.getItem('techForgeTasks')) || [];
    const cols = {
        'todo': document.getElementById('todo-list'),
        'doing': document.getElementById('doing-list'),
        'done': document.getElementById('done-list')
    };

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
            // [UPDATE] Thêm onclick để xem chi tiết
            card.onclick = function() { viewTask(task.id); };
            card.style.borderLeftColor = borderLeft;
            card.style.cursor = "pointer"; // Hand cursor

            card.innerHTML = `
                <div style="font-weight: 700; margin-bottom: 5px;">${task.name}</div>
                <div style="font-size: 0.8rem; color: var(--secondary); margin-bottom: 3px;">${task.project || 'General'}</div>
                <div style="font-size: 0.85rem; color: var(--text-light); display: flex; justify-content: space-between;">
                    <span><i class="fas fa-hashtag"></i> ${task.id}</span>
                </div>`;
            cols[task.status].appendChild(card);
        }
    });

    document.getElementById('count-todo').innerText = counts['todo'];
    document.getElementById('count-doing').innerText = counts['doing'];
    document.getElementById('count-done').innerText = counts['done'];
}

// [NEW] Hàm xem chi tiết Task
function viewTask(taskId) {
    const tasks = JSON.parse(localStorage.getItem('techForgeTasks')) || [];
    const task = tasks.find(t => t.id === taskId);

    if(task) {
        document.getElementById('detailTitle').innerText = task.name;
        document.getElementById('detailProject').innerText = task.project || "General";
        document.getElementById('detailStatus').innerText = task.status.toUpperCase();
        document.getElementById('detailDesc').innerText = task.description || "No description.";
        document.getElementById('detailPriority').innerText = task.priority.toUpperCase();

        // Đổi màu badge status
        const statusBadge = document.getElementById('detailStatus');
        statusBadge.className = 'status-badge';
        if(task.status === 'todo') statusBadge.classList.add('status-planning');
        else if(task.status === 'doing') statusBadge.classList.add('status-active');
        else statusBadge.style.backgroundColor = '#E0F2FE';

        openModal('taskDetailModal');
    }
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
        tasks[taskIndex].timestamp = new Date().toISOString();
        localStorage.setItem('techForgeTasks', JSON.stringify(tasks));
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
        let entry = payroll.find(p => p.user === userKey && p.status === 'Pending');
        if(entry) {
            entry.hours += hours;
        } else {
            payroll.push({ user: userKey, role: userObj.role, hours: hours, rate: userObj.rate, status: 'Pending' });
        }
        localStorage.setItem('techForgePayroll', JSON.stringify(payroll));
        alert("Time logged successfully!");
        closeModal('logTimeModal');
        renderPayroll();
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
    const totalEl = document.getElementById('totalPendingPayroll');
    if(totalEl) totalEl.innerText = '$' + totalPending.toLocaleString();
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
        localStorage.setItem('techForgePayroll', JSON.stringify(payroll));
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
    const todoCount = tasks.filter(t => t.status === 'todo').length;
    const doingCount = tasks.filter(t => t.status === 'doing').length;
    const doneCount = tasks.filter(t => t.status === 'done').length;
    const total = todoCount + doingCount + doneCount;

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
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, scales: { x: { max: 100 } } }
    });

    renderLiveActivity();
}

function renderLiveActivity() {
    const listContainer = document.getElementById('activityList');
    const tasks = JSON.parse(localStorage.getItem('techForgeTasks')) || [];

    const startDateVal = document.getElementById('reportStartDate').value;
    const endDateVal = document.getElementById('reportEndDate').value;

    const start = startDateVal ? new Date(startDateVal) : null;
    const end = endDateVal ? new Date(endDateVal) : null;
    if(end) end.setHours(23, 59, 59);

    listContainer.innerHTML = '';

    const activities = tasks.filter(t => t.status === 'done' || t.status === 'doing').sort((a, b) => {
        return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
    });

    let displayCount = 0;

    activities.forEach(t => {
        const tDate = t.timestamp ? new Date(t.timestamp) : new Date();

        let isVisible = true;
        if (start && tDate < start) isVisible = false;
        if (end && tDate > end) isVisible = false;

        if (isVisible) {
            displayCount++;
            const icon = t.status === 'done'
                ? '<div style="width:30px; height:30px; background:#DCFCE7; color:#16A34A; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0;"><i class="fas fa-check"></i></div>'
                : '<div style="width:30px; height:30px; background:#FEF3C7; color:#D97706; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0;"><i class="fas fa-spinner"></i></div>';

            const dateStr = tDate.toLocaleDateString() + ' ' + tDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

            const item = `
                <li style="padding-bottom: 15px; margin-bottom: 15px; border-bottom: 1px dashed #eee; display: flex; gap: 10px; animation: slideIn 0.3s;">
                    ${icon}
                    <div>
                        <div style="font-weight: 700; color: var(--text-main);">${t.name} (${t.status.toUpperCase()})</div>
                        <div style="font-size:0.8rem; color:var(--secondary);">${t.project || ''}</div>
                        <div style="color: var(--text-light); font-size: 0.8rem;">Updated: ${dateStr}</div>
                    </div>
                </li>
            `;
            listContainer.insertAdjacentHTML('beforeend', item);
        }
    });

    if (displayCount === 0) {
        listContainer.innerHTML = '<li style="text-align:center; color:#999; padding:20px;">No activities found.</li>';
    }
}

function clearActivityFilter() {
    document.getElementById('reportStartDate').value = '';
    document.getElementById('reportEndDate').value = '';
    renderLiveActivity();
}

function downloadReport() {
    const btn = document.querySelector('#client .btn-outline');
    const originalText = btn.innerHTML;
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;
    const rangeText = (startDate && endDate) ? `from ${startDate} to ${endDate}` : "full history";

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
    setTimeout(() => {
        btn.innerHTML = originalText;
        alert(`Report downloaded successfully!\n\nScope: ${rangeText}\nFormat: PDF\nSent to: ${USERS['frieza'].email}`);
    }, 1500);
}

// --- 8. UTILITIES ---
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

// Generate AI mock
function generateAI() {
    const loading = document.getElementById('aiLoading');
    const result = document.getElementById('aiResult');
    loading.style.display = 'block'; result.style.display = 'none';
    setTimeout(() => {
        loading.style.display = 'none'; result.style.display = 'block';
        result.value = "- Setup React Frontend\n- Integrate Firebase Auth\n- Connect MoMo API\n- Design DB Schema";
    }, 1500);
}