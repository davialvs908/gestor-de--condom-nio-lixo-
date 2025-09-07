// Dashboard functionality with SQLite integration
let currentUser = null;
let dashboardData = null;
let charts = {};

document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication
    await checkAuthentication();
    
    // Initialize dashboard components
    initializeDashboard();
    
    // Setup event listeners
    setupEventListeners();
    
    // Update data periodically
    setInterval(updateDashboardData, 30000); // Update every 30 seconds
});

// Authentication check
async function checkAuthentication() {
    const user = sessionStorage.getItem('smarttrash_user');
    
    if (!user) {
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
        return;
    }
    
    // Update user info in header
    const userData = JSON.parse(user);
    updateUserInfo(userData);
    
    // Load real dashboard data if user has ID (real login)
    if (userData.id && !userData.mode) {
        await loadRealDashboardData(userData);
    }
}

// Update user information in header
function updateUserInfo(userData) {
    const userNameEl = document.querySelector('.user-name');
    const userRoleEl = document.querySelector('.user-role');
    
    if (userNameEl) {
        userNameEl.textContent = userData.name;
    }
    
    if (userRoleEl) {
        const role = userData.user_type || userData.role || 'Usuário';
        const location = userData.condominium || 'SmartTrash';
        userRoleEl.textContent = `${role} - ${location}`;
    }
}

// Load real dashboard data from SQLite API
async function loadRealDashboardData(userData) {
    try {
        // Assumindo condominium_id = 1 para demo, ou buscar do userData
        const condominiumId = userData.condominium_id || 1;
        
        const response = await fetch(`http://localhost:5000/api/dashboard/${condominiumId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('📊 Dados reais carregados:', data);
            
            // Atualizar interface com dados reais
            updateDashboardWithRealData(data);
            
            // Dados reais carregados com sucesso
        } else {
            console.warn('⚠️ Erro ao carregar dados reais');
        }
    } catch (error) {
        console.error('❌ Erro na API do dashboard:', error);
    }
}

// Update dashboard interface with real SQLite data
function updateDashboardWithRealData(data) {
    // Atualizar estatísticas
    if (data.stats) {
        const stats = data.stats;
        
        // Total de sensores
        const totalSensorsEl = document.querySelector('.stat-number[data-stat="sensors"]');
        if (totalSensorsEl) {
            totalSensorsEl.textContent = stats.total_sensors || 0;
        }
        
        // Nível médio
        const avgLevelEl = document.querySelector('.stat-number[data-stat="avg-level"]');
        if (avgLevelEl) {
            avgLevelEl.textContent = `${Math.round(stats.avg_fill_level || 0)}%`;
        }
        
        // Sensores que precisam coleta
        const needCollectionEl = document.querySelector('.stat-number[data-stat="need-collection"]');
        if (needCollectionEl) {
            needCollectionEl.textContent = stats.sensors_need_collection || 0;
        }
        
        // Sensores críticos
        const criticalEl = document.querySelector('.stat-number[data-stat="critical"]');
        if (criticalEl) {
            criticalEl.textContent = stats.critical_sensors || 0;
        }
    }
    
    // Atualizar lista de sensores
    if (data.sensors) {
        updateSensorsList(data.sensors);
    }
    
    // Atualizar alertas
    if (data.alerts) {
        updateAlertsList(data.alerts);
    }
}

// Update sensors list with real data
function updateSensorsList(sensors) {
    const sensorsContainer = document.querySelector('.sensors-grid, .sensors-list');
    if (!sensorsContainer) return;
    
    sensorsContainer.innerHTML = '';
    
    sensors.forEach(sensor => {
        const sensorCard = createSensorCard(sensor);
        sensorsContainer.appendChild(sensorCard);
    });
}

// Create sensor card element
function createSensorCard(sensor) {
    const card = document.createElement('div');
    card.className = `sensor-card ${sensor.status}`;
    
    const statusIcon = {
        'critical': '🔴',
        'warning': '🟡',
        'attention': '🟠',
        'normal': '🟢'
    }[sensor.status] || '⚪';
    
    card.innerHTML = `
        <div class="sensor-header">
            <div class="sensor-status">${statusIcon}</div>
            <div class="sensor-info">
                <h4>${sensor.sensor_code}</h4>
                <p>${sensor.location}</p>
            </div>
        </div>
        <div class="sensor-level">
            <div class="level-bar">
                <div class="level-fill" style="height: ${sensor.fill_level}%"></div>
            </div>
            <span class="level-text">${sensor.fill_level}%</span>
        </div>
        <div class="sensor-details">
            <small>Bateria: ${sensor.battery_voltage}V</small>
            <small>Última leitura: ${formatDateTime(sensor.reading_timestamp)}</small>
        </div>
    `;
    
    return card;
}

// Update alerts list
function updateAlertsList(alerts) {
    const alertsContainer = document.querySelector('.alerts-list');
    if (!alertsContainer) return;
    
    alertsContainer.innerHTML = '';
    
    if (alerts.length === 0) {
        alertsContainer.innerHTML = '<p class="no-alerts">✅ Nenhum alerta ativo</p>';
        return;
    }
    
    alerts.forEach(alert => {
        const alertItem = createAlertItem(alert);
        alertsContainer.appendChild(alertItem);
    });
}

// Create alert item element
function createAlertItem(alert) {
    const item = document.createElement('div');
    item.className = `alert-item ${alert.severity}`;
    
    const severityIcon = {
        'critical': '🚨',
        'high': '⚠️',
        'medium': '🔔',
        'low': 'ℹ️'
    }[alert.severity] || '📢';
    
    item.innerHTML = `
        <div class="alert-icon">${severityIcon}</div>
        <div class="alert-content">
            <h5>${alert.message}</h5>
            <p>Local: ${alert.location}</p>
            <small>${formatDateTime(alert.created_at)}</small>
        </div>
        <button class="alert-resolve" onclick="resolveAlert(${alert.id})">
            <i class="fas fa-check"></i>
        </button>
    `;
    
    return item;
}

// Data source indicator removed for cleaner interface

// Format datetime for display
function formatDateTime(timestamp) {
    if (!timestamp) return 'N/A';
    
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Load demo data
function loadDemoData() {
    dashboardData = {
        stats: {
            total_sensors: 12,
            avg_fill_level: 68,
            sensors_need_collection: 3,
            critical_sensors: 1
        },
        sensors: [
            {
                id: 1,
                sensor_code: 'ST001',
                location: 'Bloco A - Térreo',
                fill_level: 45,
                status: 'normal',
                battery_voltage: 4.1,
                reading_timestamp: new Date().toISOString()
            },
            {
                id: 2,
                sensor_code: 'ST002',
                location: 'Bloco B - Térreo',
                fill_level: 78,
                status: 'attention',
                battery_voltage: 3.8,
                reading_timestamp: new Date().toISOString()
            },
            {
                id: 3,
                sensor_code: 'ST003',
                location: 'Área de Lazer',
                fill_level: 92,
                status: 'critical',
                battery_voltage: 4.0,
                reading_timestamp: new Date().toISOString()
            },
            {
                id: 4,
                sensor_code: 'ST004',
                location: 'Garagem',
                fill_level: 23,
                status: 'normal',
                battery_voltage: 4.2,
                reading_timestamp: new Date().toISOString()
            }
        ],
        alerts: [
            {
                id: 1,
                severity: 'critical',
                message: 'Contêiner crítico! Nível: 92%',
                location: 'Área de Lazer',
                created_at: new Date().toISOString()
            }
        ]
    };
    
    updateDashboardWithRealData(dashboardData);
}

// Initialize dashboard
function initializeDashboard() {
    // Show dashboard section by default
    showSection('dashboard');
    
    // Load saved settings
    loadSettings();
    
    // Load notifications
    updateNotificationCount();
    loadNotifications();
    
    // Start data refresh timer
    restartDataRefresh();
    
    // Create demo notifications if none exist
    createDemoNotifications();
    
    // Initialize chart containers
    setTimeout(() => {
        if (dashboardData) {
            updateCharts(dashboardData);
        }
    }, 100);
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('href').substring(1);
            showSection(section);
        });
    });
}

// Show section
function showSection(sectionName) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeNavItem = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }
    
    // Show content section
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

// Update containers grid
function updateContainersGrid(sensors) {
    const containersGrid = document.getElementById('containersGrid');
    if (!containersGrid) return;
    
    containersGrid.innerHTML = '';
    
    sensors.forEach(sensor => {
        const containerCard = createContainerCard(sensor);
        containersGrid.appendChild(containerCard);
    });
}

// Create container card element
function createContainerCard(sensor) {
    const card = document.createElement('div');
    card.className = `container-card ${sensor.status}`;
    
    const statusText = {
        'critical': 'Crítico',
        'warning': 'Atenção',
        'attention': 'Atenção',
        'normal': 'Normal'
    }[sensor.status] || 'Normal';
    
    card.innerHTML = `
        <div class="container-header">
            <div class="container-name">${sensor.location}</div>
            <div class="container-status ${sensor.status}">${statusText}</div>
        </div>
        <div class="container-level">
            <div class="level-bar">
                <div class="level-fill" style="width: ${sensor.fill_level}%"></div>
            </div>
            <div class="level-text">${sensor.fill_level}% preenchido</div>
        </div>
        <div class="container-details">
            <span>Código: ${sensor.sensor_code}</span>
            <span>Bateria: ${sensor.battery_voltage}V</span>
        </div>
    `;
    
    return card;
}

// Update charts
function updateCharts(data) {
    updateLevelsChart(data);
    updateCollectionsChart(data);
}

// Update levels chart
function updateLevelsChart(data) {
    const ctx = document.getElementById('levelsChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (charts.levels) {
        charts.levels.destroy();
    }
    
    // Generate hourly data for today
    const hours = [];
    const levels = [];
    
    for (let i = 0; i < 24; i++) {
        hours.push(`${i.toString().padStart(2, '0')}:00`);
        const baseLevel = 25;
        const variation = Math.sin((i / 24) * Math.PI * 2) * 20 + Math.random() * 10;
        levels.push(Math.max(0, Math.min(100, baseLevel + variation + (i * 2))));
    }
    
    charts.levels = new Chart(ctx, {
        type: 'line',
        data: {
            labels: hours,
            datasets: [{
                label: 'Nível Médio (%)',
                data: levels,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

// Update collections chart
function updateCollectionsChart(data) {
    const ctx = document.getElementById('collectionsChart');
    if (!ctx) return;
    
    // Destroy existing chart
    if (charts.collections) {
        charts.collections.destroy();
    }
    
    const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    const collections = [4, 3, 5, 2, 4, 3, 1];
    
    charts.collections = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: days,
            datasets: [{
                label: 'Coletas',
                data: collections,
                backgroundColor: [
                    '#10b981', '#10b981', '#f59e0b', '#10b981', 
                    '#10b981', '#10b981', '#6b7280'
                ],
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Event handlers - toggleNotifications moved below with enhanced functionality

function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

function logout() {
    // Confirmação com modal personalizado
    const modal = document.createElement('div');
    modal.className = 'modal logout-modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content logout-content">
            <div class="logout-header">
                <i class="fas fa-sign-out-alt"></i>
                <h3>Confirmar Logout</h3>
            </div>
            <p>Tem certeza que deseja sair do sistema?</p>
            <div class="logout-buttons">
                <button class="btn btn-outline" onclick="closeLogoutModal()">
                    <i class="fas fa-times"></i> Cancelar
                </button>
                <button class="btn btn-primary" onclick="confirmLogout()">
                    <i class="fas fa-sign-out-alt"></i> Sair
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Bloquear scroll do body
    document.body.style.overflow = 'hidden';
    
    // Função para fechar modal
    window.closeLogoutModal = function() {
        modal.remove();
        document.body.style.overflow = '';
    };
    
    // Função para confirmar logout
    window.confirmLogout = function() {
        sessionStorage.removeItem('smarttrash_user');
        localStorage.removeItem('smarttrash_user');
        
        // Mostrar mensagem de logout
        const logoutMessage = document.createElement('div');
        logoutMessage.className = 'logout-message';
        logoutMessage.innerHTML = `
            <div class="logout-message-content">
                <i class="fas fa-check-circle"></i>
                <span>Logout realizado com sucesso!</span>
            </div>
        `;
        document.body.appendChild(logoutMessage);
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    };
    
    // Fechar com ESC
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeLogoutModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

function addContainer() {
    const modal = document.getElementById('addContainerModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Update dashboard data periodically
async function updateDashboardData() {
    if (currentUser && currentUser.id && !currentUser.mode) {
        await loadRealDashboardData(currentUser);
    }
}

// Resolve alert function
async function resolveAlert(alertId) {
    try {
        console.log('Resolving alert:', alertId);
        
        // For demo, just remove the alert from the list
        if (dashboardData && dashboardData.alerts) {
            dashboardData.alerts = dashboardData.alerts.filter(alert => alert.id !== alertId);
            updateAlertsList(dashboardData.alerts);
            updateNotificationCount(dashboardData.alerts.length);
        }
        
        showSuccessMessage('Alerta resolvido com sucesso!');
    } catch (error) {
        console.error('Erro ao resolver alerta:', error);
    }
}

function showSuccessMessage(message) {
    const messageEl = document.createElement('div');
    messageEl.className = 'success-message';
    messageEl.textContent = message;
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
    `;
    
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
        messageEl.remove();
    }, 3000);
}

// Initialize charts
function initializeCharts() {
    // Levels Chart
    const levelsCtx = document.getElementById('levelsChart');
    if (levelsCtx) {
        new Chart(levelsCtx, {
            type: 'line',
            data: {
                labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
                datasets: [{
                    label: 'Nível Médio (%)',
                    data: [25, 30, 45, 60, 75, 68, 70],
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Collections Chart
    const collectionsCtx = document.getElementById('collectionsChart');
    if (collectionsCtx) {
        new Chart(collectionsCtx, {
            type: 'bar',
            data: {
                labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
                datasets: [{
                    label: 'Coletas',
                    data: [4, 3, 5, 2, 4, 3, 1],
                    backgroundColor: [
                        '#10b981',
                        '#10b981',
                        '#f59e0b',
                        '#10b981',
                        '#10b981',
                        '#10b981',
                        '#6b7280'
                    ],
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
}

// Initialize notifications
function initializeNotifications() {
    const notificationBtn = document.querySelector('.notification-btn');
    const notificationPanel = document.getElementById('notificationPanel');
    const closeNotifications = document.querySelector('.close-notifications');
    
    if (notificationBtn && notificationPanel) {
        notificationBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            notificationPanel.classList.toggle('active');
        });
        
        if (closeNotifications) {
            closeNotifications.addEventListener('click', function() {
                notificationPanel.classList.remove('active');
            });
        }
        
        // Close when clicking outside
        document.addEventListener('click', function(e) {
            if (!notificationPanel.contains(e.target) && !notificationBtn.contains(e.target)) {
                notificationPanel.classList.remove('active');
            }
        });
    }
}

// Initialize sidebar
function initializeSidebar() {
    const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
    
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            sidebarLinks.forEach(l => l.parentElement.classList.remove('active'));
            
            // Add active class to clicked link
            this.parentElement.classList.add('active');
            
            // Handle navigation (for demo purposes, we'll just show different content)
            const section = this.getAttribute('href').substring(1);
            handleSectionNavigation(section);
        });
    });
}

// Initialize user menu
function initializeUserMenu() {
    const userMenu = document.querySelector('.user-menu');
    const userDropdown = document.querySelector('.user-dropdown');
    
    if (userMenu && userDropdown) {
        userMenu.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });
        
        // Close when clicking outside
        document.addEventListener('click', function(e) {
            if (!userMenu.contains(e.target)) {
                userDropdown.classList.remove('active');
            }
        });
    }
}

// Handle section navigation
function handleSectionNavigation(section) {
    // For demo purposes, we'll just show different content
    // In a real application, this would load different components
    
    switch(section) {
        case 'containers':
            showContainersView();
            break;
        case 'collections':
            showCollectionsView();
            break;
        case 'reports':
            showReportsView();
            break;
        case 'alerts':
            showAlertsView();
            break;
        case 'residents':
            showResidentsView();
            break;
        case 'settings':
            showSettingsView();
            break;
        default:
            showDashboardView();
    }
}

// View functions (simplified for demo)
function showDashboardView() {
    // Show main dashboard content
    console.log('Showing dashboard view');
}

function showContainersView() {
    showMessage('Carregando visualização de contêineres...', 'info');
}

function showCollectionsView() {
    showMessage('Carregando histórico de coletas...', 'info');
}

function showReportsView() {
    showMessage('Carregando relatórios...', 'info');
}

function showAlertsView() {
    showMessage('Carregando alertas...', 'info');
}

function showResidentsView() {
    showMessage('Carregando comunicação com moradores...', 'info');
}

function showSettingsView() {
    showMessage('Carregando configurações...', 'info');
}

// Update dashboard data
function updateDashboardData() {
    // Simulate real-time data updates
    updateContainerLevels();
    updateStats();
    checkForNewAlerts();
}

// Update container levels
function updateContainerLevels() {
    const containers = document.querySelectorAll('.container-card');
    
    containers.forEach(container => {
        const levelFill = container.querySelector('.level-fill');
        const levelText = container.querySelector('.level-text');
        
        if (levelFill && levelText) {
            // Simulate small random changes
            const currentLevel = parseInt(levelText.textContent);
            const change = Math.random() * 4 - 2; // -2 to +2
            const newLevel = Math.max(0, Math.min(100, currentLevel + change));
            
            levelFill.style.width = newLevel + '%';
            levelText.textContent = Math.round(newLevel) + '%';
            
            // Update status based on level
            updateContainerStatus(container, newLevel);
        }
    });
}

// Update container status
function updateContainerStatus(container, level) {
    const statusBadge = container.querySelector('.status-badge');
    
    // Remove existing status classes
    container.classList.remove('status-normal', 'status-warning', 'status-critical');
    
    if (level >= 85) {
        container.classList.add('status-critical');
        statusBadge.textContent = 'Crítico';
        statusBadge.className = 'status-badge critical';
    } else if (level >= 70) {
        container.classList.add('status-warning');
        statusBadge.textContent = 'Atenção';
        statusBadge.className = 'status-badge warning';
    } else {
        container.classList.add('status-normal');
        statusBadge.textContent = 'Normal';
        statusBadge.className = 'status-badge normal';
    }
}

// Update stats
function updateStats() {
    const statCards = document.querySelectorAll('.stat-card h3');
    
    statCards.forEach((stat, index) => {
        if (index === 1) { // Average level
            const containers = document.querySelectorAll('.level-text');
            let totalLevel = 0;
            
            containers.forEach(levelText => {
                totalLevel += parseInt(levelText.textContent);
            });
            
            const avgLevel = Math.round(totalLevel / containers.length);
            stat.textContent = avgLevel + '%';
        }
    });
}

// Check for new alerts
function checkForNewAlerts() {
    const containers = document.querySelectorAll('.container-card');
    let criticalCount = 0;
    
    containers.forEach(container => {
        if (container.classList.contains('status-critical')) {
            criticalCount++;
        }
    });
    
    // Update notification badge
    const notificationBadge = document.querySelector('.notification-badge');
    if (notificationBadge) {
        notificationBadge.textContent = criticalCount;
        notificationBadge.style.display = criticalCount > 0 ? 'block' : 'none';
    }
}

// Message function
function showMessage(message, type = 'info') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message-toast');
    existingMessages.forEach(msg => msg.remove());
    
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `message-toast ${type}`;
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';
    if (type === 'warning') icon = 'fa-exclamation-triangle';
    
    messageEl.innerHTML = `
        <div class="message-content">
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        </div>
        <button class="message-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to page
    document.body.appendChild(messageEl);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (messageEl.parentElement) {
            messageEl.remove();
        }
    }, 3000);
}

// Logout function already defined above

// Settings Management
function saveAlertSettings() {
    const criticalLevel = document.getElementById('criticalLevel').value;
    const warningLevel = document.getElementById('warningLevel').value;
    
    // Validação
    if (parseInt(criticalLevel) <= parseInt(warningLevel)) {
        showMessage('Erro: Nível crítico deve ser maior que nível de atenção!', 'error');
        return;
    }
    
    // Salvar no localStorage
    const settings = {
        criticalLevel: parseInt(criticalLevel),
        warningLevel: parseInt(warningLevel),
        timestamp: Date.now()
    };
    
    localStorage.setItem('smarttrash_alert_settings', JSON.stringify(settings));
    
    // Mostrar sucesso
    showMessage('Configurações de alertas salvas com sucesso!', 'success');
    
    // Aplicar mudanças imediatamente nos contêineres
    updateContainerAlerts();
}

function saveNotificationSettings() {
    const emailNotifications = document.getElementById('emailNotifications').checked;
    const whatsappNotifications = document.getElementById('whatsappNotifications').checked;
    
    const settings = {
        email: emailNotifications,
        whatsapp: whatsappNotifications,
        timestamp: Date.now()
    };
    
    localStorage.setItem('smarttrash_notification_settings', JSON.stringify(settings));
    showMessage('Configurações de notificações salvas com sucesso!', 'success');
}

function saveSystemSettings() {
    const readingInterval = document.getElementById('readingInterval').value;
    
    const settings = {
        readingInterval: parseInt(readingInterval),
        timestamp: Date.now()
    };
    
    localStorage.setItem('smarttrash_system_settings', JSON.stringify(settings));
    showMessage('Configurações do sistema salvas com sucesso!', 'success');
    
    // Reiniciar timer de atualização com novo intervalo
    restartDataRefresh();
}

// Carregar configurações salvas
function loadSettings() {
    // Carregar configurações de alertas
    const alertSettings = localStorage.getItem('smarttrash_alert_settings');
    if (alertSettings) {
        const parsed = JSON.parse(alertSettings);
        const criticalInput = document.getElementById('criticalLevel');
        const warningInput = document.getElementById('warningLevel');
        
        if (criticalInput) criticalInput.value = parsed.criticalLevel;
        if (warningInput) warningInput.value = parsed.warningLevel;
    }
    
    // Carregar configurações de notificações
    const notificationSettings = localStorage.getItem('smarttrash_notification_settings');
    if (notificationSettings) {
        const parsed = JSON.parse(notificationSettings);
        const emailInput = document.getElementById('emailNotifications');
        const whatsappInput = document.getElementById('whatsappNotifications');
        
        if (emailInput) emailInput.checked = parsed.email;
        if (whatsappInput) whatsappInput.checked = parsed.whatsapp;
    }
    
    // Carregar configurações do sistema
    const systemSettings = localStorage.getItem('smarttrash_system_settings');
    if (systemSettings) {
        const parsed = JSON.parse(systemSettings);
        const intervalInput = document.getElementById('readingInterval');
        
        if (intervalInput) intervalInput.value = parsed.readingInterval;
    }
}

// Aplicar configurações de alerta aos contêineres
function updateContainerAlerts() {
    const alertSettings = localStorage.getItem('smarttrash_alert_settings');
    if (!alertSettings) return;
    
    const settings = JSON.parse(alertSettings);
    
    // Atualizar todos os contêineres visíveis
    document.querySelectorAll('.container-card').forEach(card => {
        const progressBar = card.querySelector('.progress-fill');
        const statusBadge = card.querySelector('.status-badge');
        
        if (progressBar && statusBadge) {
            const level = parseInt(progressBar.style.width);
            
            // Remover classes antigas
            card.classList.remove('critical', 'warning', 'normal');
            statusBadge.classList.remove('critical', 'warning', 'normal');
            
            // Aplicar novas classes baseadas nas configurações
            if (level >= settings.criticalLevel) {
                card.classList.add('critical');
                statusBadge.classList.add('critical');
                statusBadge.textContent = 'Crítico';
            } else if (level >= settings.warningLevel) {
                card.classList.add('warning');
                statusBadge.classList.add('warning');
                statusBadge.textContent = 'Atenção';
            } else {
                card.classList.add('normal');
                statusBadge.classList.add('normal');
                statusBadge.textContent = 'Normal';
            }
        }
    });
}

// Reiniciar refresh de dados
function restartDataRefresh() {
    // Limpar timer existente se houver
    if (window.dataRefreshTimer) {
        clearInterval(window.dataRefreshTimer);
    }
    
    const systemSettings = localStorage.getItem('smarttrash_system_settings');
    let interval = 15; // padrão 15 minutos
    
    if (systemSettings) {
        interval = JSON.parse(systemSettings).readingInterval;
    }
    
    // Iniciar novo timer
    window.dataRefreshTimer = setInterval(async () => {
        if (currentUser) {
            await loadRealDashboardData(currentUser);
        }
    }, interval * 60 * 1000); // converter para millisegundos
}

// Sistema de notificações aprimorado
function createNotification(title, message, type = 'info') {
    const notificationSettings = localStorage.getItem('smarttrash_notification_settings');
    let settings = { email: true, whatsapp: true };
    
    if (notificationSettings) {
        settings = JSON.parse(notificationSettings);
    }
    
    // Criar notificação visual
    const notification = {
        id: Date.now(),
        title: title,
        message: message,
        type: type,
        timestamp: new Date().toISOString(),
        read: false
    };
    
    // Adicionar à lista de notificações
    let notifications = JSON.parse(localStorage.getItem('smarttrash_notifications') || '[]');
    notifications.unshift(notification);
    
    // Manter apenas as últimas 50 notificações
    if (notifications.length > 50) {
        notifications = notifications.slice(0, 50);
    }
    
    localStorage.setItem('smarttrash_notifications', JSON.stringify(notifications));
    
    // Atualizar contador
    updateNotificationCount();
    
    // Simular envio por email/WhatsApp (em produção, seria uma chamada à API)
    if (settings.email) {
        console.log(`📧 Email enviado: ${title} - ${message}`);
    }
    if (settings.whatsapp) {
        console.log(`📱 WhatsApp enviado: ${title} - ${message}`);
    }
    
    return notification;
}

// Atualizar contador de notificações
function updateNotificationCount() {
    const notifications = JSON.parse(localStorage.getItem('smarttrash_notifications') || '[]');
    const unreadCount = notifications.filter(n => !n.read).length;
    
    const countElement = document.getElementById('notificationCount');
    if (countElement) {
        countElement.textContent = unreadCount;
        countElement.style.display = unreadCount > 0 ? 'block' : 'none';
    }
}

// Marcar todas notificações como lidas
function markAllAsRead() {
    const notifications = JSON.parse(localStorage.getItem('smarttrash_notifications') || '[]');
    notifications.forEach(n => n.read = true);
    localStorage.setItem('smarttrash_notifications', JSON.stringify(notifications));
    
    updateNotificationCount();
    loadNotifications();
}

// Carregar e exibir notificações
function loadNotifications() {
    const notifications = JSON.parse(localStorage.getItem('smarttrash_notifications') || '[]');
    const container = document.getElementById('notificationsList');
    
    if (!container) return;
    
    if (notifications.length === 0) {
        container.innerHTML = '<p class="no-notifications">Nenhuma notificação</p>';
        return;
    }
    
    container.innerHTML = notifications.map(notification => {
        const time = new Date(notification.timestamp).toLocaleString('pt-BR');
        const typeIcon = {
            info: 'fa-info-circle',
            warning: 'fa-exclamation-triangle', 
            error: 'fa-times-circle',
            success: 'fa-check-circle'
        };
        
        return `
            <div class="notification-item ${notification.read ? 'read' : 'unread'}" data-id="${notification.id}">
                <div class="notification-icon ${notification.type}">
                    <i class="fas ${typeIcon[notification.type] || 'fa-info-circle'}"></i>
                </div>
                <div class="notification-content">
                    <h5>${notification.title}</h5>
                    <p>${notification.message}</p>
                    <span class="notification-time">${time}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Export functions for global access
window.logout = logout;
window.showMessage = showMessage;
window.saveAlertSettings = saveAlertSettings;
window.saveNotificationSettings = saveNotificationSettings;
window.saveSystemSettings = saveSystemSettings;
window.markAllAsRead = markAllAsRead;
window.createNotification = createNotification;

// Create demo notifications for professional appearance
function createDemoNotifications() {
    const existingNotifications = JSON.parse(localStorage.getItem('smarttrash_notifications') || '[]');
    
    // Only create demo notifications if none exist
    if (existingNotifications.length === 0) {
        const now = Date.now();
        const demoNotifications = [
            {
                id: now - 5000,
                title: 'Contêiner A3 - Nível Crítico',
                message: 'Contêiner no Bloco A, nível 3 atingiu 95% da capacidade. Coleta urgente recomendada.',
                type: 'error',
                timestamp: new Date(now - 30 * 60 * 1000).toISOString(), // 30 min ago
                read: false
            },
            {
                id: now - 4000,
                title: 'Sistema Atualizado',
                message: 'Nova versão do SmartTrash instalada com sucesso. Melhorias na precisão dos sensores.',
                type: 'success',
                timestamp: new Date(now - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
                read: false
            },
            {
                id: now - 3000,
                title: 'Manutenção Programada',
                message: 'Manutenção preventiva agendada para domingo às 08:00. Duração estimada: 2 horas.',
                type: 'info',
                timestamp: new Date(now - 4 * 60 * 60 * 1000).toISOString(), // 4h ago
                read: true
            },
            {
                id: now - 2000,
                title: 'Contêiner B1 - Atenção',
                message: 'Nível de preenchimento atingiu 75%. Monitoramento em andamento.',
                type: 'warning',
                timestamp: new Date(now - 6 * 60 * 60 * 1000).toISOString(), // 6h ago
                read: true
            },
            {
                id: now - 1000,
                title: 'Relatório Mensal Disponível',
                message: 'Relatório de desempenho de outubro está pronto para download na seção Relatórios.',
                type: 'info',
                timestamp: new Date(now - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
                read: true
            }
        ];
        
        localStorage.setItem('smarttrash_notifications', JSON.stringify(demoNotifications));
        updateNotificationCount();
        loadNotifications();
    }
}

// Toggle notification dropdown
function toggleNotifications() {
    const dropdown = document.getElementById('notificationsDropdown');
    if (dropdown) {
        const isVisible = dropdown.classList.contains('show');
        
        // Close other dropdowns
        document.querySelectorAll('.show').forEach(element => {
            element.classList.remove('show');
        });
        
        if (!isVisible) {
            dropdown.classList.add('show');
            loadNotifications(); // Refresh notifications when opening
        }
    }
}

// Export new functions
window.createDemoNotifications = createDemoNotifications;
window.toggleNotifications = toggleNotifications;
