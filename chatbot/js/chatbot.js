// BlockElevate AI Assistant Chatbot

class BlockElevateChatbot {
    constructor() {
        this.isOpen = false;
        this.currentUser = null;
        this.mockData = this.initializeMockData();
        this.init();
    }

    init() {
        this.createChatbotHTML();
        this.setupEventListeners();
        this.addWelcomeMessage();
    }

    initializeMockData() {
        return {
            inmates: {
                'INM001': {
                    name: 'John Doe',
                    programs: ['GED Preparation', 'Anger Management', 'Vocational Training'],
                    progress: { ged: 75, anger: 90, vocational: 60 },
                    mentalHealth: { moodScore: 7.5, sessionsCompleted: 12 },
                    nextParole: '2024-06-15',
                    housingOptions: ['Halfway House A', 'Transitional Housing B'],
                    jobPlacements: ['Construction Helper', 'Warehouse Worker']
                }
            },
            staff: {
                'STF001': {
                    name: 'Jane Smith',
                    caseload: 25,
                    activeCases: ['INM001', 'INM002', 'INM003'],
                    recentUpdates: ['John Doe completed anger management', 'New housing referral available']
                }
            },
            resources: {
                housing: ['Second Chance Housing', 'Reentry Apartments', 'Halfway House Network'],
                jobs: ['Construction Jobs Plus', 'Warehouse Opportunities', 'Food Service Training'],
                legal: ['Legal Aid Society', 'Reentry Law Clinic', 'Public Defender Office'],
                mental: ['Community Mental Health', 'Addiction Recovery Center', 'Counseling Services']
            },
            programs: {
                education: ['GED Preparation', 'College Courses', 'Trade Certification'],
                vocational: ['Construction Training', 'Culinary Arts', 'Computer Skills'],
                therapy: ['Individual Counseling', 'Group Therapy', 'Substance Abuse Treatment']
            }
        };
    }

    createChatbotHTML() {
        const chatbotHTML = `
            <div class="chatbot-container">
                <button class="chatbot-toggle" id="chatbot-toggle">
                    <div class="chatbot-brand">B<span class="chatbot-e">E</span></div>
                </button>
                <div class="chatbot-window" id="chatbot-window">
                    <div class="chatbot-header">
                        <span>BlockElevate Assistant</span>
                        <button class="chatbot-close" id="chatbot-close">×</button>
                    </div>
                    <div class="chatbot-messages" id="chatbot-messages">
                        <!-- Messages will be added here -->
                    </div>
                    <div class="typing-indicator" id="typing-indicator">
                        Assistant is typing...
                    </div>
                    <div class="chatbot-input-container">
                        <input type="text" class="chatbot-input" id="chatbot-input" 
                               placeholder="Ask about programs, progress, resources...">
                        <button class="chatbot-send" id="chatbot-send">Send</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    }

    setupEventListeners() {
        // Chatbot toggle button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'chatbot-toggle' || e.target.closest('#chatbot-toggle')) {
                this.toggleChat();
            }
            if (e.target.id === 'chatbot-close') {
                this.toggleChat();
            }
            if (e.target.id === 'chatbot-send') {
                this.sendMessage();
            }
        });

        // Input field events
        document.addEventListener('keypress', (e) => {
            if (e.target.id === 'chatbot-input' && e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Listen for user changes from main app
        window.addEventListener('userChanged', (event) => {
            this.currentUser = event.detail;
            this.addWelcomeMessage();
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        const window = document.getElementById('chatbot-window');
        window.classList.toggle('open', this.isOpen);
        
        if (this.isOpen) {
            document.getElementById('chatbot-input').focus();
        }
    }

    handleKeyPress(event) {
        if (event.key === 'Enter') {
            this.sendMessage();
        }
    }

    sendMessage() {
        const input = document.getElementById('chatbot-input');
        const message = input.value.trim();
        
        if (!message) return;

        this.addMessage(message, 'user');
        input.value = '';
        
        this.showTyping();
        setTimeout(() => {
            this.hideTyping();
            this.processMessage(message);
        }, 1000);
    }

    addMessage(text, sender) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.textContent = text;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    addMessageWithActions(text, actions = []) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot';
        
        // Convert text formatting to HTML
        const formattedText = text
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/•/g, '&bull;')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        messageDiv.innerHTML = `<p>${formattedText}</p>`;
        
        if (actions.length > 0) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'quick-actions';
            actions.forEach(action => {
                const button = document.createElement('button');
                button.className = 'quick-action';
                button.textContent = action;
                button.dataset.action = action;
                button.addEventListener('click', () => this.handleQuickAction(action));
                actionsDiv.appendChild(button);
            });
            messageDiv.appendChild(actionsDiv);
        }
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    showTyping() {
        document.getElementById('typing-indicator').style.display = 'block';
        const messagesContainer = document.getElementById('chatbot-messages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTyping() {
        document.getElementById('typing-indicator').style.display = 'none';
    }

    addWelcomeMessage() {
        const messagesContainer = document.getElementById('chatbot-messages');
        messagesContainer.innerHTML = '';
        
        const userType = this.currentUser?.role || 'Guest';
        const userName = this.currentUser?.name || 'User';
        
        let welcomeText = `Hello ${userName}! I'm your BlockElevate Assistant. `;
        let quickActions = [];

        switch (userType) {
            case 'Inmate':
                welcomeText += 'I can help you with program progress, mental health resources, and reentry planning.';
                quickActions = ['My Progress', 'Programs', 'Mental Health', 'Reentry Resources'];
                break;
            case 'Case Manager':
                welcomeText += 'I can help you manage cases, track progress, and find resources for your clients.';
                quickActions = ['Caseload Status', 'Client Progress', 'Available Resources', 'Program Updates'];
                break;
            case 'SuperAdmin':
            case 'Admin User':
                welcomeText += 'I can provide system analytics, user management info, and platform insights.';
                quickActions = ['System Status', 'User Analytics', 'Program Statistics', 'Resource Management'];
                break;
            case 'External':
                welcomeText += 'I can help you access client information and coordinate resources.';
                quickActions = ['Client Access', 'Resource Coordination', 'Progress Reports', 'Contact Info'];
                break;
            default:
                welcomeText += 'I can help you navigate the platform and find information.';
                quickActions = ['Platform Overview', 'Available Programs', 'How to Get Started'];
        }

        this.addMessageWithActions(welcomeText, quickActions);
    }

    processMessage(message) {
        const lowerMessage = message.toLowerCase();
        let response = '';
        let actions = [];

        // Progress-related queries
        if (lowerMessage.includes('progress') || lowerMessage.includes('status')) {
            response = this.getProgressInfo();
        }
        // Program-related queries
        else if (lowerMessage.includes('program') || lowerMessage.includes('class') || lowerMessage.includes('education')) {
            response = this.getProgramInfo();
            actions = ['GED Progress', 'Vocational Training', 'Therapy Programs'];
        }
        // Mental health queries
        else if (lowerMessage.includes('mental') || lowerMessage.includes('mood') || lowerMessage.includes('therapy')) {
            response = this.getMentalHealthInfo();
            actions = ['Log Mood', 'Schedule Session', 'Crisis Resources'];
        }
        // Resource queries
        else if (lowerMessage.includes('housing') || lowerMessage.includes('job') || lowerMessage.includes('resource')) {
            response = this.getResourceInfo();
            actions = ['Housing Options', 'Job Opportunities', 'Legal Aid'];
        }
        // Reentry queries
        else if (lowerMessage.includes('reentry') || lowerMessage.includes('parole') || lowerMessage.includes('release')) {
            response = this.getReentryInfo();
            actions = ['Parole Timeline', 'Housing Search', 'Job Placement'];
        }
        // System queries (admin)
        else if (lowerMessage.includes('system') || lowerMessage.includes('analytics') || lowerMessage.includes('users')) {
            response = this.getSystemInfo();
            actions = ['User Stats', 'System Health', 'Platform Usage'];
        }
        // General help
        else {
            response = this.getGeneralHelp();
            actions = ['My Progress', 'Programs', 'Resources', 'Help'];
        }

        this.addMessageWithActions(response, actions);
    }

    getProgressInfo() {
        const userType = this.currentUser?.role;
        
        if (userType === 'Inmate') {
            return `**Your Current Progress:**\n\n• GED Preparation: 75% complete\n• Anger Management: 90% complete\n• Vocational Training: 60% complete\n\nYou're doing great! Keep up the excellent work.`;
        } else if (userType === 'Case Manager') {
            return `**Caseload Overview:**\n\n• Total Cases: 25\n• Active This Week: 18\n• Completed Programs: 7\n• Upcoming Parole Reviews: 3\n\nRecent updates available for John Doe and Sarah Johnson.`;
        } else {
            return `**System Progress:**\n\n• Total Users: 1,247\n• Active Programs: 456\n• Completion Rate: 78%\n• System Uptime: 99.9%`;
        }
    }

    getProgramInfo() {
        return `**Available Programs:**\n\n**📚 Education:**\n• GED Preparation\n• College Courses\n• Trade Certification\n\n**🔧 Vocational:**\n• Construction Training\n• Culinary Arts\n• Computer Skills\n\n**🧠 Therapy:**\n• Individual Counseling\n• Group Therapy\n• Substance Abuse Treatment`;
    }

    getMentalHealthInfo() {
        const userType = this.currentUser?.role;
        
        if (userType === 'Inmate') {
            return `**Your Mental Health Summary:**\n\n• Current Mood Score: 7.5/10\n• Sessions Completed: 12\n• Next Appointment: Tomorrow 2:00 PM\n\n**Remember:** You can log your daily mood and access crisis resources 24/7.`;
        } else {
            return `**Mental Health Resources:**\n\n• Individual Counseling Available\n• Group Therapy Sessions\n• Crisis Intervention 24/7\n• Meditation and Mindfulness\n• Substance Abuse Support\n\nAll services are confidential and professionally staffed.`;
        }
    }

    getResourceInfo() {
        return `**External Resources Available:**\n\n**🏠 Housing:**\n• Second Chance Housing\n• Reentry Apartments\n• Halfway House Network\n\n**💼 Employment:**\n• Construction Jobs Plus\n• Warehouse Opportunities\n• Food Service Training\n\n**⚖️ Legal Aid:**\n• Legal Aid Society\n• Reentry Law Clinic\n• Public Defender Office`;
    }

    getReentryInfo() {
        const userType = this.currentUser?.role;
        
        if (userType === 'Inmate') {
            return `Your Reentry Plan:\n• Projected Parole Date: June 15, 2024\n• Housing Options: 2 approved locations\n• Job Placements: 3 opportunities lined up\n• Required Programs: 85% complete\n\nYou're on track for successful reentry!`;
        } else {
            return `Reentry Support Services:\n• Housing Placement Assistance\n• Job Training and Placement\n• Legal Aid and Advocacy\n• Family Reunification Support\n• Ongoing Case Management\n\nWe provide comprehensive support for successful community reintegration.`;
        }
    }

    getSystemInfo() {
        return `System Analytics:\n• Total Platform Users: 1,247\n• Daily Active Users: 89\n• Program Enrollments: 456\n• Resource Connections: 234\n• System Performance: Excellent\n• Database Health: All systems operational\n\nAll integrations are functioning normally.`;
    }

    getGeneralHelp() {
        return `I can help you with:\n\n• Program progress and enrollment\n• Mental health resources and tracking\n• Reentry planning and resources\n• Housing and job opportunities\n• System navigation and support\n\nJust ask me anything about your BlockElevate experience!`;
    }

    handleQuickAction(action) {
        // Simulate clicking on the action
        this.addMessage(action, 'user');
        this.showTyping();
        
        setTimeout(() => {
            this.hideTyping();
            this.processMessage(action);
        }, 800);
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chatbot = new BlockElevateChatbot();
});