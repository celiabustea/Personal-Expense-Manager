# Personal Expense Manager

A comprehensive full-stack expense management application with AI-powered financial insights, built with React, Next.js, Node.js, and TypeScript.

## 🌟 Features

- **💰 Expense Tracking**: Add, edit, and categorize transactions with multi-currency support
- **📊 Budget Management**: Create and monitor budgets with visual progress indicators
- **📈 Financial Reports**: Detailed analytics with charts and spending insights
- **🤖 AI Financial Assistant**: Personalized recommendations using local AI (Ollama + Mistral) - *Note: Local AI setup required, may not work on all systems. You can use this application without the AI*
- **📱 Receipt OCR**: Upload receipts and automatically extract transaction data
- **🌙 Dark Mode**: Full dark/light theme support
- **💱 Multi-Currency**: Support for multiple currencies with conversion
- **📤 Data Export**: Export data in CSV/JSON formats
- **🔒 Secure Authentication**: User authentication with Supabase
- **📱 Responsive Design**: Mobile-friendly interface

## 🏗 Architecture

```
Personal-Expense-Manager/
├── frontend/           # Next.js React frontend
├── backend/           # Node.js Express backend
└── AI_SETUP_GUIDE.md # AI assistant setup instructions
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- Ollama (for AI features, optional - local setup required)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Personal-Expense-Manager
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Configure environment variables
   cp .env.example .env
   # Edit .env with your database credentials
   
   # Start the backend server
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   
   # Configure environment variables
   cp .env.example .env.local
   # Edit .env.local with your API endpoints
   
   # Start the frontend development server
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🤖 AI Assistant Setup (Optional)

⚠️ **Important**: The AI assistant uses local processing with Ollama and may not work on all systems due to hardware requirements and setup complexity.

See [`AI_SETUP_GUIDE.md`](AI_SETUP_GUIDE.md) for detailed setup instructions.

### Quick AI Setup
```bash
# Install Ollama from https://ollama.ai
# Install Mistral model
ollama pull mistral
# Start Ollama service
ollama serve
```

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js, React, TypeScript
- **State Management**: Redux Toolkit
- **Styling**: CSS Modules, Styled Components
- **UI Components**: Custom atomic design components
- **Charts**: Recharts
- **Authentication**: Supabase Auth

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with TypeORM
- **Authentication**: Supabase integration
- **AI Integration**: Ollama API (local)

## 📊 Key Features

### Transaction Management
- Comprehensive income and expense tracking
- Multi-currency support with automatic conversion
- Receipt upload with OCR text extraction using [`Tesseract`]

### Budget Tracking
- Visual progress indicators and smart notifications
- Multi-currency budget support.

### AI Financial Assistant
- **Local AI processing** - All analysis happens on your machine via [`aiController`](backend/src/controllers/aiController.ts)
- Personalized spending insights and budget optimization
- Privacy-focused with explicit user consent managed in [`privacyUtils`](frontend/src/utils/privacyUtils.ts)
- **May not work on all systems** - Requires Ollama setup and sufficient hardware

## 🔒 Security & Privacy

- User authentication with Supabase
- **Local AI processing** - No financial data sent to external services
- Explicit user consent for AI features via [`settings`](frontend/pages/settings.tsx)
- Row-level security for data isolation

## 📱 Usage

1. **Sign Up/Login**: Create account to access dashboard
2. **Add Transactions**: Record income and expenses
3. **Create Budgets**: Set spending limits by category
4. **AI Insights**: Enable in [`settings`](frontend/pages/settings.tsx) for personalized recommendations (*local setup required*)
5. **View Reports**: Analyze spending patterns and trends

## 🆘 Troubleshooting

### AI Assistant Issues
- Check [`AI_SETUP_GUIDE.md`](AI_SETUP_GUIDE.md) for setup instructions
- Verify Ollama is running: `ollama serve`
- Ensure Mistral model is installed: `ollama list`
- **Note**: AI features may not work due to hardware limitations or setup complexity

### General Issues
For other problems, ensure:
- All dependencies are installed
- Environment variables are configured
- Database is running and accessible
- Ports 3000 (frontend) and 5000 (backend) are available

Built with ❤️ for better financial management

**Note**: AI features require local setup and may not work on all systems due to hardware requirements.

