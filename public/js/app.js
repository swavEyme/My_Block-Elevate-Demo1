// BlockElevate Central Hub Frontend Application

class BlockElevateApp {
    constructor() {
        this.apiBase = 'http://localhost:3001/api';
        this.currentUser = null;
        this.authToken = localStorage.getItem('authToken');
        this.init();
    }

    init() {
        this.setupEventListeners();
        if (this.authToken) {
            this.validateToken();
        }
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Demo account buttons
        document.querySelectorAll('.demo-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleDemoLogin(e));
        });

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleNavigation(e));
        });
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(`${this.apiBase}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                this.setAuthToken(data.token);
                await this.loadUserProfile();
                this.showDashboard();
            } else {
                alert('Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed. Please try again.');
        }
    }

    handleDemoLogin(e) {
        const role = e.target.dataset.role;
        const demoCredentials = {
            inmate: { email: 'inmate@demo.com', name: 'John Doe', role: 'Inmate', id: 'INM001' },
            staff: { email: 'staff@demo.com', name: 'Jane Smith', role: 'Case Manager', id: 'STF001' },
            admin: { email: 'admin@demo.com', name: 'Admin User', role: 'SuperAdmin', id: 'ADM001' },
            external: { email: 'external@demo.com', name: 'Resource Provider', role: 'External', id: 'EXT001' }
        };

        const user = demoCredentials[role];
        if (user) {
            this.currentUser = user;
            this.setAuthToken('demo-token-' + role);
            this.showDashboard();
            this.updateUserInterface();
        }
    }

    async validateToken() {
        try {
            const response = await fetch(`${this.apiBase}/auth/me`, {
                headers: { 'Authorization': `Bearer ${this.authToken}` }
            });

            if (response.ok) {
                const data = await response.json();
                this.currentUser = data.user;
                this.showDashboard();
                this.updateUserInterface();
            } else {
                this.handleLogout();
            }
        } catch (error) {
            console.error('Token validation error:', error);
            this.handleLogout();
        }
    }

    async loadUserProfile() {
        // Mock user profile loading
        this.currentUser = {
            name: 'Demo User',
            email: document.getElementById('email').value,
            role: 'BasicUser',
            id: 'USR001'
        };
        this.updateUserInterface();
    }

    setAuthToken(token) {
        this.authToken = token;
        localStorage.setItem('authToken', token);
    }

    handleLogout() {
        this.authToken = null;
        this.currentUser = null;
        localStorage.removeItem('authToken');
        this.showLogin();
    }

    showLogin() {
        document.getElementById('login-section').style.display = 'block';
        document.getElementById('dashboard-section').style.display = 'none';
        document.getElementById('user-info').style.display = 'none';
    }

    showDashboard() {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('dashboard-section').style.display = 'block';
        document.getElementById('user-info').style.display = 'flex';
        this.loadContent('profile');
    }

    updateUserInterface() {
        if (this.currentUser) {
            document.getElementById('user-name').textContent = this.currentUser.name;
            
            // Show/hide admin features
            const adminBtns = document.querySelectorAll('.admin-only');
            const isAdmin = this.currentUser.role === 'SuperAdmin' || this.currentUser.role === 'Admin User';
            adminBtns.forEach(btn => {
                btn.style.display = isAdmin ? 'block' : 'none';
            });
            
            // Notify chatbot of user change
            window.dispatchEvent(new CustomEvent('userChanged', { detail: this.currentUser }));
        }
    }

    handleNavigation(e) {
        const platform = e.target.dataset.platform;
        
        // Update active nav button
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        this.loadContent(platform);
    }

    loadContent(platform) {
        const content = document.getElementById('main-content');
        
        switch (platform) {
            case 'profile':
                content.innerHTML = this.getProfileContent();
                break;
            case 'mental-health':
                content.innerHTML = this.getMentalHealthContent();
                break;
            case 'programs':
                content.innerHTML = this.getProgramsContent();
                break;
            case 'resources':
                content.innerHTML = this.getResourcesContent();
                break;
            case 'progress':
                content.innerHTML = this.getProgressContent();
                break;
            case 'admin':
                content.innerHTML = this.getAdminContent();
                break;
            default:
                content.innerHTML = this.getProfileContent();
        }
    }

    getProfileContent() {
        return `
            <div class="profile-grid">
                <div class="profile-card">
                    <h3>Personal Information</h3>
                    <div class="profile-info">
                        <div class="info-row">
                            <span>Name:</span>
                            <span>${this.currentUser?.name || 'Demo User'}</span>
                        </div>
                        <div class="info-row">
                            <span>ID:</span>
                            <span>${this.currentUser?.id || 'USR001'}</span>
                        </div>
                        <div class="info-row">
                            <span>Role:</span>
                            <span>${this.currentUser?.role || 'BasicUser'}</span>
                        </div>
                        <div class="info-row">
                            <span>Status:</span>
                            <span class="status active">Active</span>
                        </div>
                    </div>
                </div>
                <div class="profile-card">
                    <h3>Progress Overview</h3>
                    <div class="progress-section">
                        <p>Mental Health Program</p>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 75%"></div>
                        </div>
                        <p>Educational Programs</p>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 60%"></div>
                        </div>
                        <p>Behavioral Goals</p>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 85%"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getMentalHealthContent() {
        return `
            <h2>Mental Health Center</h2>
            <div class="cards-grid">
                <div class="card">
                    <h4>Daily Wellness Check</h4>
                    <p>Track your mood and mental state</p>
                    <div class="card-actions">
                        <button class="btn" onclick="app.trackMood()">Log Mood</button>
                    </div>
                </div>
                <div class="card">
                    <h4>Meditation Sessions</h4>
                    <p>Guided meditation and mindfulness</p>
                    <div class="card-actions">
                        <button class="btn" onclick="app.startMeditation()">Start Session</button>
                    </div>
                </div>
                <div class="card">
                    <h4>Therapy Resources</h4>
                    <p>Access to counseling and support</p>
                    <div class="card-actions">
                        <button class="btn" onclick="app.viewResources()">View Resources</button>
                    </div>
                </div>
                <div class="card">
                    <h4>Progress Tracking</h4>
                    <p>Monitor your mental health journey</p>
                    <div class="card-actions">
                        <button class="btn" onclick="app.viewProgress()">View Progress</button>
                    </div>
                </div>
            </div>
        `;
    }

    getProgramsContent() {
        return `
            <h2>Educational & Rehabilitation Programs</h2>
            <div class="cards-grid">
                <div class="card">
                    <h4>GED Preparation</h4>
                    <p>Complete your high school education</p>
                    <div class="card-actions">
                        <button class="btn">Enroll</button>
                        <button class="btn btn-secondary">View Details</button>
                    </div>
                </div>
                <div class="card">
                    <h4>Vocational Training</h4>
                    <p>Learn job skills for reentry</p>
                    <div class="card-actions">
                        <button class="btn">Browse Programs</button>
                    </div>
                </div>
                <div class="card">
                    <h4>Substance Abuse Program</h4>
                    <p>Recovery and rehabilitation support</p>
                    <div class="card-actions">
                        <button class="btn">Join Program</button>
                    </div>
                </div>
                <div class="card">
                    <h4>Life Skills Training</h4>
                    <p>Prepare for successful reintegration</p>
                    <div class="card-actions">
                        <button class="btn">Start Training</button>
                    </div>
                </div>
            </div>
        `;
    }

    getResourcesContent() {
        return `
            <h2>External Resources</h2>
            <div class="cards-grid">
                <div class="card">
                    <h4>Housing Assistance</h4>
                    <p>Find transitional and permanent housing</p>
                    <div class="card-actions">
                        <button class="btn">Search Housing</button>
                    </div>
                </div>
                <div class="card">
                    <h4>Job Placement</h4>
                    <p>Employment opportunities and support</p>
                    <div class="card-actions">
                        <button class="btn">Find Jobs</button>
                    </div>
                </div>
                <div class="card">
                    <h4>Legal Aid</h4>
                    <p>Legal assistance and advocacy</p>
                    <div class="card-actions">
                        <button class="btn">Contact Lawyer</button>
                    </div>
                </div>
                <div class="card">
                    <h4>Family Services</h4>
                    <p>Reconnect with family and support systems</p>
                    <div class="card-actions">
                        <button class="btn">Family Programs</button>
                    </div>
                </div>
            </div>
        `;
    }

    getProgressContent() {
        return `
            <h2>Progress Tracking</h2>
            <div class="admin-stats">
                <div class="stat-card">
                    <div class="stat-number">75%</div>
                    <div class="stat-label">Program Completion</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">28</div>
                    <div class="stat-label">Days Active</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">12</div>
                    <div class="stat-label">Goals Achieved</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">4.2</div>
                    <div class="stat-label">Avg Mood Score</div>
                </div>
            </div>
            <div class="card">
                <h4>Recent Activities</h4>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Activity</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>2024-01-15</td>
                            <td>Meditation Session</td>
                            <td><span class="status active">Completed</span></td>
                        </tr>
                        <tr>
                            <td>2024-01-14</td>
                            <td>GED Math Class</td>
                            <td><span class="status active">Completed</span></td>
                        </tr>
                        <tr>
                            <td>2024-01-13</td>
                            <td>Counseling Session</td>
                            <td><span class="status active">Completed</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    getAdminContent() {
        return `
            <h2>Admin Dashboard</h2>
            <div class="admin-stats">
                <div class="stat-card">
                    <div class="stat-number">1,247</div>
                    <div class="stat-label">Total Users</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">89</div>
                    <div class="stat-label">Active Today</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">456</div>
                    <div class="stat-label">In Programs</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">99.9%</div>
                    <div class="stat-label">System Uptime</div>
                </div>
            </div>
            <div class="cards-grid">
                <div class="card">
                    <h4>User Management</h4>
                    <p>Manage user accounts and permissions</p>
                    <div class="card-actions">
                        <button class="btn">Manage Users</button>
                    </div>
                </div>
                <div class="card">
                    <h4>System Analytics</h4>
                    <p>View platform usage and performance</p>
                    <div class="card-actions">
                        <button class="btn">View Analytics</button>
                    </div>
                </div>
                <div class="card">
                    <h4>External Integrations</h4>
                    <p>Manage third-party connections</p>
                    <div class="card-actions">
                        <button class="btn">Configure</button>
                    </div>
                </div>
                <div class="card">
                    <h4>System Health</h4>
                    <p>Monitor system status and performance</p>
                    <div class="card-actions">
                        <button class="btn">System Status</button>
                    </div>
                </div>
            </div>
        `;
    }

    // Interactive functions
    trackMood() {
        alert('Mood tracking feature - would integrate with API');
    }

    startMeditation() {
        alert('Meditation session starting - would integrate with meditation API');
    }

    viewResources() {
        alert('Loading therapy resources - would fetch from mental health API');
    }

    viewProgress() {
        alert('Progress tracking - would show detailed analytics');
    }
}

// Initialize the application
const app = new BlockElevateApp();