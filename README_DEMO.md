# BlockElevate - MVP Demo

## 🚀 Quick Demo Setup

This is a **demonstration version** with mock data - no database setup required!

### Instant Demo
```bash
git clone <your-repo>
cd BlockElevate
npm install
npm run dev
```

Open `http://localhost:3001` and click any **Demo Account** button.

### Demo Features
- ✅ **Full UI/UX** - Complete frontend with BlockElevate branding
- ✅ **Role-based Access** - Different interfaces for Inmates, Staff, Admin, External
- ✅ **AI Chatbot** - Interactive assistant with mock data responses
- ✅ **Mock Data** - Realistic prison ecosystem data for demonstration
- ✅ **API Architecture** - Complete backend structure ready for real databases

### Demo Accounts
- **Inmate Access** - Progress tracking, mental health, reentry planning
- **Staff Access** - Case management, client monitoring
- **Admin Access** - System analytics, user management
- **External Resource** - Client access, resource coordination

### For Production
When ready for real deployment:
1. Set up PostgreSQL, MongoDB, Redis databases
2. Add credentials to `.env` file
3. Run database schema files (`core.sql`, `RBAC.sql`)
4. Configure external API integrations

### Architecture
- **Platform 1**: PostgreSQL (Users/Auth/RBAC)
- **Platform 2**: MongoDB (Behavioral Data)
- **Platform 3**: Redis (Caching/Sessions)
- **Platform 4**: API Integration Hub
- **Frontend**: Role-based dashboards + AI chatbot