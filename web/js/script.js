// --- AUTHENTICATION & DATA ---
const USERS = {
    'vegeta': {
        pass: '123', role: 'manager', name: 'Vegeta (CEO)',
        avatar: 'assets/vegeta.png',
        email: 'vegeta@saiyan.com',
        rate: 100,
        skills: { 'Management': 'Expert', 'Strategy': 'Master' }
    },
    'goku': {
        pass: '123', role: 'employee', name: 'Goku (Dev)',
        avatar: 'assets/goku.png',
        email: 'goku@saiyan.com',
        rate: 50,
        skills: { 'Java': 'Expert', 'Spring Boot': 'Advanced', 'React': 'Intermediate' }
    },
    'bulma': {
        pass: '123', role: 'admin', name: 'Bulma (Finance)',
        avatar: 'assets/bulma.png',
        email: 'bulma@capsule.corp',
        rate: 80,
        skills: { 'Finance': 'Expert', 'Excel': 'Master' }
    },
    'frieza': {
        pass: '123', role: 'client', name: 'Frieza (Client)',
        avatar: 'assets/frieza.png',
        email: 'frieza@empire.com',
        rate: 0,
        skills: {}
    }
};

// Initialize Mock Payroll Data if empty
if (!localStorage.getItem('techForgePayroll')) {
    const initialPayroll = [
        { user: 'goku', role: 'Dev', hours: 10, rate: 50, status: 'Pending' },
        { user: 'vegeta', role: 'CEO', hours: 5, rate: 100, status: 'Paid' }
    ];
    localStorage.setItem('techForgePayroll', JSON.stringify(initialPayroll));
}

function handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('username').value.toLowerCase().trim();
    const pass = document.getElementById('password').value;
    const errorMsg = document.getElementById('loginError');
    const card = document.getElementById('loginCard');

    if (USERS[user] && USERS[user].pass === pass) {
        // Store current user
        localStorage.setItem('currentUser', user);

        document.getElementById('loginView').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('loginView').style.display = 'none';
            document.getElementById('appView').style.display = 'block';
            loadUserWorkspace(USERS[user]);
        }, 500);
    } else {
        errorMsg.style.display = 'block';
        card.classList.add('shake');
        setTimeout(() => card.classList.remove('shake'), 500);
    }
}

function loadUserWorkspace(userData) {
    document.getElementById('currentUser').innerText = userData.name;
    const avatarEl = document.getElementById('userAvatar');
    avatarEl.src = userData.avatar;

    document.querySelectorAll('.nav-item').forEach(el => el.style.display = 'none');

    if (userData.role === 'manager') {
        document.getElementById('nav-manager').style.display = 'flex';
        switchView('manager', document.getElementById('nav-manager'));
    } else if (userData.role === 'employee') {
        document.getElementById('nav-employee').style.display = 'flex';
        switchView('employee', document.getElementById('nav-employee'));
        initKanban();
    } else if (userData.role === 'admin') {
        document.getElementById('nav-admin').style.display = 'flex';
        switchView('admin', document.getElementById('nav-admin'));
        renderPayroll(); // Load payroll data for admin
    } else if (userData.role === 'client') {
        document.getElementById('nav-client').style.display = 'flex';
        switchView('client', document.getElementById('nav-client'));
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    document.getElementById('appView').style.display = 'none';
    document.getElementById('loginView').style.display = 'flex';
    document.getElementById('loginView').style.opacity = '1';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

function togglePassword() {
    const input = document.getElementById('password');
    const icon = document.querySelector('.toggle-password');
    if (input.type === "password") {
        input.type = "text";
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = "password";
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// --- APP LOGIC ---
function switchView(viewId, element) {
    document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    if(element) element.classList.add('active');

    // [NEW] Call the new render function for client view
    if (viewId === 'client') { setTimeout(renderClientDashboard, 100); }
}

function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
window.onclick = function(e) { if(e.target.classList.contains('modal-overlay')) e.target.style.display = 'none'; }

// --- FILTER ---
function toggleFilters() {
    const panel = document.getElementById('projectFilters');
    panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
}

function filterProjects() {
    const status = document.getElementById('filterStatus').value.toLowerCase();
    const text = document.getElementById('filterInput').value.toLowerCase();
    const rows = document.querySelectorAll('#projectTableBody tr');
    rows.forEach(row => {
        const rowText = row.innerText.toLowerCase();
        const matchesStatus = status === 'all' || rowText.includes(status);
        const matchesText = rowText.includes(text);
        row.style.display = (matchesStatus && matchesText) ? '' : 'none';
    });
}

// --- PROJECT CREATION ---
function saveProject() {
    const name = document.getElementById('projName').value;
    const budget = document.getElementById('projBudget').value;
    const deadline = document.getElementById('projDeadline').value;
    if(!name || !budget || !deadline) { alert("Please fill in all required fields!"); return; }
    const tbody = document.getElementById('projectTableBody');
    const row = `<tr>
                    <td><strong>${name}</strong></td><td>Client Inc.</td><td>$${budget}</td><td>${deadline}</td>
                    <td><span class="status-badge status-planning">Planning</span></td>
                    <td><button class="btn btn-outline" style="padding: 5px 10px; font-size: 0.7rem;" onclick="openModal('assignTaskModal')">Manage</button></td>
                </tr>`;
    tbody.innerHTML += row;
    alert("Project Created Successfully!");
    closeModal('createProjectModal');
}

// --- AI & TASK ASSIGNMENT ---
function generateAI() {
    const loading = document.getElementById('aiLoading');
    const result = document.getElementById('aiResult');
    loading.style.display = 'block'; result.style.display = 'none';
    setTimeout(() => {
        loading.style.display = 'none'; result.style.display = 'block';
        result.value = "- Setup React Frontend\n- Integrate Firebase Auth\n- Connect MoMo API\n- Design DB Schema";
    }, 1500);
}

function scanStaffAI() {
    const btn = document.querySelector('#scanBtnContainer button');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Scanning...';
    setTimeout(() => {
        document.getElementById('scanBtnContainer').style.display = 'none';
        document.getElementById('aiStaffResult').style.display = 'block';
        document.getElementById('assignActionBtns').style.display = 'block';
    }, 1500);
}

function confirmAssignment() {
    const taskName = "Design Database Schema";
    let allTasks = JSON.parse(localStorage.getItem('techForgeTasks')) || [];
    allTasks.push({
        name: taskName,
        id: "T-NEW-" + Date.now().toString().slice(-4),
        status: "todo",
        priority: "high"
    });
    localStorage.setItem('techForgeTasks', JSON.stringify(allTasks));

    alert("Task Assigned to Son Goku successfully! Check Employee View.");
    closeModal('assignTaskModal');
    renderKanban();
}

// --- KANBAN BOARD LOGIC ---
function initKanban() {
    if(!localStorage.getItem('techForgeTasks')) {
        const defaultTasks = [
            { id: 'T-101', name: 'DB Schema Design', status: 'todo', priority: 'high' },
            { id: 'T-105', name: 'API Auth Module', status: 'doing', priority: 'high' },
            { id: 'T-099', name: 'Req Gathering', status: 'done', priority: 'low' }
        ];
        localStorage.setItem('techForgeTasks', JSON.stringify(defaultTasks));
    }
    renderKanban();
}

function renderKanban() {
    const tasks = JSON.parse(localStorage.getItem('techForgeTasks')) || [];
    const cols = {
        'todo': document.getElementById('todo-list'),
        'doing': document.getElementById('doing-list'),
        'done': document.getElementById('done-list')
    };

    for(let key in cols) {
        const header = cols[key].querySelector('.kanban-header');
        cols[key].innerHTML = '';
        cols[key].appendChild(header);
    }

    const counts = { 'todo': 0, 'doing': 0, 'done': 0 };

    tasks.forEach(task => {
        if(cols[task.status]) {
            counts[task.status]++;

            const borderLeft = task.priority === 'high' ? 'var(--danger)' : (task.priority === 'med' ? 'var(--accent)' : 'var(--success)');

            const card = document.createElement('div');
            card.className = `task-card priority-${task.priority}`;
            card.draggable = true;
            card.id = task.id;
            card.ondragstart = drag;
            card.style.borderLeftColor = borderLeft;
            if(task.status === 'done') card.style.opacity = '0.7';

            card.innerHTML = `
                <div style="font-weight: 700; margin-bottom: 5px; ${task.status === 'done' ? 'text-decoration: line-through;' : ''}">${task.name}</div>
                <div style="font-size: 0.85rem; color: var(--text-light); display: flex; justify-content: space-between; align-items: center;">
                    <span><i class="fas fa-hashtag"></i> ${task.id}</span>
                    ${task.status === 'doing' ? '<span style="background: var(--primary); color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem;">ACTIVE</span>' : ''}
                </div>
            `;
            cols[task.status].appendChild(card);
        }
    });

    document.getElementById('count-todo').innerText = counts['todo'];
    document.getElementById('count-doing').innerText = counts['doing'];
    document.getElementById('count-done').innerText = counts['done'];
}

function allowDrop(ev) { ev.preventDefault(); ev.currentTarget.classList.add('drag-over'); }
function dragLeave(ev) { ev.currentTarget.classList.remove('drag-over'); }
function drag(ev) { ev.dataTransfer.setData("text", ev.target.id); ev.target.classList.add('dragging'); }

function drop(ev, newStatus) {
    ev.preventDefault();
    ev.currentTarget.classList.remove('drag-over');
    const taskId = ev.dataTransfer.getData("text");
    const draggedElement = document.getElementById(taskId);

    if(draggedElement) {
        draggedElement.classList.remove('dragging');
        let tasks = JSON.parse(localStorage.getItem('techForgeTasks')) || [];
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if(taskIndex > -1) {
            tasks[taskIndex].status = newStatus;
            localStorage.setItem('techForgeTasks', JSON.stringify(tasks));
            renderKanban();
        }
    }
}

document.querySelectorAll('.kanban-col').forEach(col => {
    col.addEventListener('dragleave', function(e) { this.classList.remove('drag-over'); });
});

// --- TIMER & PAYROLL LOGIC ---
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

function saveLogTime() {
    const hours = parseFloat(document.getElementById('logHours').value);
    const currentUserKey = localStorage.getItem('currentUser');
    const userObj = USERS[currentUserKey];

    if (userObj) {
        let payrollData = JSON.parse(localStorage.getItem('techForgePayroll')) || [];
        let existingEntry = payrollData.find(entry => entry.user === currentUserKey && entry.status === 'Pending');

        if (existingEntry) {
            existingEntry.hours += hours;
        } else {
            payrollData.push({
                user: currentUserKey,
                role: userObj.role === 'manager' ? 'CEO' : 'Dev',
                hours: hours,
                rate: userObj.rate,
                status: 'Pending'
            });
        }

        localStorage.setItem('techForgePayroll', JSON.stringify(payrollData));
        alert(`Logged ${hours} hours successfully! Payroll updated for Admin.`);
        closeModal('logTimeModal');
        renderPayroll();
    }
}

// --- ADMIN PAYROLL LOGIC ---
function renderPayroll() {
    const tbody = document.getElementById('payrollTableBody');
    if (!tbody) return; // Guard clause if not on admin view
    tbody.innerHTML = '';
    const payrollData = JSON.parse(localStorage.getItem('techForgePayroll')) || [];
    let totalPending = 0;

    payrollData.forEach(entry => {
        const amount = entry.hours * entry.rate;
        if (entry.status === 'Pending') { totalPending += amount; }
        const statusBadge = entry.status === 'Pending'
            ? '<span style="color:var(--warning); font-weight: bold;">Pending</span>'
            : '<span style="color:var(--success); font-weight: bold;">Paid <i class="fas fa-check"></i></span>';

        const row = `<tr>
            <td>${USERS[entry.user] ? USERS[entry.user].name : entry.user}</td>
            <td>${entry.role}</td>
            <td>${entry.hours.toFixed(1)}h</td>
            <td>$${amount.toFixed(2)}</td>
            <td>${statusBadge}</td>
        </tr>`;
        tbody.innerHTML += row;
    });
    const totalEl = document.getElementById('totalPendingPayroll');
    if(totalEl) totalEl.innerText = `$${totalPending.toFixed(2)}`;
}

function processPayment() {
    let payrollData = JSON.parse(localStorage.getItem('techForgePayroll')) || [];
    let hasPending = false;
    payrollData.forEach(entry => {
        if (entry.status === 'Pending') {
            entry.status = 'Paid';
            hasPending = true;
        }
    });
    if (hasPending) {
        localStorage.setItem('techForgePayroll', JSON.stringify(payrollData));
        renderPayroll();
        alert('Payment Processed Successfully via MoMo!');
    } else {
        alert('No pending payments to process.');
    }
    closeModal('momoModal');
}

// --- FINANCE REPORT ---
function generateFinanceReport(btn) {
    btn.innerText = "Analyzing...";
    setTimeout(() => {
        document.getElementById('financeAiText').innerText = "Analysis Complete: Project 'E-Commerce' is 15% over budget due to overtime. Recommended action: Review 'API Auth' task complexity.";
        btn.style.display = 'none';
    }, 2000);
}

// --- [UPDATED] CLIENT CHART & GANTT LOGIC ---
let teamChartInstance = null;
let ganttChartInstance = null;

function renderClientDashboard() {
    // 1. Render Team Progress Chart
    const ctxTeam = document.getElementById('teamProgressChart').getContext('2d');
    if (teamChartInstance) { teamChartInstance.destroy(); }

    teamChartInstance = new Chart(ctxTeam, {
        type: 'bar',
        data: {
            labels: ['Dev Team', 'Design Team', 'QA Team'],
            datasets: [{
                label: 'Tasks Completed',
                data: [12, 8, 5], // Mock data
                backgroundColor: [
                    'rgba(248, 91, 26, 0.7)', // Primary
                    'rgba(7, 32, 131, 0.7)',  // Secondary
                    'rgba(247, 179, 45, 0.7)' // Accent
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });

    // 2. Render Project Gantt Chart (Using Horizontal Bar for simulation)
    const ctxGantt = document.getElementById('projectGanttChart').getContext('2d');
    if (ganttChartInstance) { ganttChartInstance.destroy(); }

    ganttChartInstance = new Chart(ctxGantt, {
        type: 'bar',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [
                {
                    label: 'Planned Timeline',
                    data: [100, 80, 60, 40], // Mock progress data
                    backgroundColor: 'rgba(200, 200, 200, 0.5)',
                    borderColor: '#999',
                    borderWidth: 1,
                    type: 'line' // Show plan as a line overlay
                },
                {
                    label: 'Actual Progress',
                    data: [100, 85, 55, 30], // Mock actual data
                    backgroundColor: 'rgba(5, 150, 105, 0.6)', // Green for success
                    borderColor: '#059669',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y', // Makes it horizontal like a Gantt
            scales: {
                x: { beginAtZero: true, max: 100, title: { display: true, text: '% Completion' } }
            }
        }
    });
}

// --- PROFILE LOGIC ---
function openProfileModal() {
    const usernameInput = localStorage.getItem('currentUser') || 'vegeta';
    const user = USERS[usernameInput];
    if (!user) return;

    document.getElementById('profileAvatarPreview').src = user.avatar;
    document.getElementById('profileNameDisplay').innerText = user.name;
    document.getElementById('profileRoleDisplay').innerText = user.role.toUpperCase();
    document.getElementById('profileEmail').value = user.email;
    document.getElementById('profileRate').value = user.rate;

    const skillContainer = document.getElementById('skillList');
    skillContainer.innerHTML = '';

    for (const [skill, level] of Object.entries(user.skills)) {
        const skillHTML = `
            <div style="background: white; padding: 6px 10px; border-radius: 6px; border: 1px solid #eee; margin-bottom: 6px; font-size: 0.85rem; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                <span style="font-weight: 600; color: var(--text-main);">${skill}</span>
                <span style="font-size: 0.75rem; padding: 2px 8px; border-radius: 10px; background: #EFF6FF; color: var(--primary); font-weight: bold;">${level}</span>
            </div>`;
        skillContainer.insertAdjacentHTML('beforeend', skillHTML);
    }

    openModal('profileModal');
}

function saveProfile() {
    const rate = document.getElementById('profileRate').value;
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser && USERS[currentUser]) {
        USERS[currentUser].rate = parseFloat(rate); // Update in-memory rate
    }
    alert(`Đã cập nhật hồ sơ!\nMức lương mới: $${rate}/hr\nSkills: Đã đồng bộ lên hệ thống AI.`);
    closeModal('profileModal');
}