# AI Financial Assistant Setup Guide

This guide will help you set up the AI Financial Assistant feature using Ollama with Mistral for personalized financial insights.

## Prerequisites

1. **Ollama** - Local AI runtime
2. **Mistral Model** - AI model for financial analysis
3. **Node.js** - For running the backend and frontend

## Setup Instructions

### 1. Install Ollama

Download and install Ollama from [https://ollama.ai](https://ollama.ai)

For Windows:
```powershell
# Download the installer from the website and run it
```

### 2. Install Mistral Model

Once Ollama is installed, open a terminal and run:

```bash
ollama pull mistral
```

This will download the Mistral model (approximately 4GB).

### 3. Start Ollama Service

Start the Ollama service:

```bash
ollama serve
```

The service will run on `http://localhost:11434` by default.

### 4. Verify Installation

Check if Mistral is installed:

```bash
ollama list
```

You should see `mistral` in the list of available models.

### 5. Backend Setup

Navigate to the backend directory and install dependencies:

```powershell
cd backend
npm install
```

Start the backend server:

```powershell
npm run dev
```

The backend will run on `http://localhost:5000`.

### 6. Frontend Setup

Navigate to the frontend directory and install dependencies:

```powershell
cd frontend
npm install
```

Start the frontend development server:

```powershell
npm run dev
```

The frontend will run on `http://localhost:3000`.

## Usage Instructions

### 1. Enable AI Data Usage

1. Go to the **Settings** page
2. Toggle on **"AI Data Usage"**
3. Accept the privacy notice

### 2. Access the AI Assistant

1. Navigate to the **AI** page
2. The system will check if Ollama and Mistral are available
3. If everything is working, you'll see "Analyze Data" buttons

### 3. Analyze Your Financial Data

1. Click either **"Analyze Data (JSON)"** or **"Analyze Data (CSV)"**
2. The system will:
   - Export your financial data (transactions and budgets)
   - Send it to Mistral for analysis
   - Display personalized insights

### 4. Review AI Insights

The AI will provide:
- **2 Personalized Suggestions** - Specific recommendations based on your data
- **1 Question/Insight** - Proactive financial question or observation
- **Encouragement** - Positive feedback if you've hit budgeting goals

## API Endpoints

### Backend AI Routes

- `POST /ai/analyze` - Analyze financial data
- `GET /ai/health` - Check AI service health

### Request Format

```json
{
  "exportData": "CSV or JSON string of financial data",
  "format": "csv" | "json"
}
```

### Response Format

```json
{
  "success": true,
  "data": {
    "suggestions": ["suggestion 1", "suggestion 2"],
    "question": "insightful question",
    "encouragement": "positive message"
  }
}
```

## Troubleshooting

### Ollama Not Available

**Error**: "AI service is not available"

**Solutions**:
1. Ensure Ollama is installed and running
2. Check if the service is running on `http://localhost:11434`
3. Try restarting Ollama: `ollama serve`

### Mistral Model Not Found

**Error**: "Mistral model not found"

**Solutions**:
1. Install the model: `ollama pull mistral`
2. Verify installation: `ollama list`
3. Try a different model name if needed

### Connection Refused

**Error**: "ECONNREFUSED"

**Solutions**:
1. Check if Ollama service is running
2. Verify the port (default: 11434)
3. Check firewall settings

### No Financial Data

**Error**: "No financial data available to analyze"

**Solutions**:
1. Add some transactions in the app
2. Create some budgets
3. Ensure you're logged in and data is saved

### AI Data Usage Not Enabled

**Error**: "Please enable AI Data Usage in Settings first"

**Solutions**:
1. Go to Settings page
2. Toggle on "AI Data Usage"
3. Accept the privacy notice

## Configuration

### Environment Variables

**Backend (.env)**:
```
OLLAMA_BASE_URL=http://localhost:11434
PORT=5000
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env.local)**:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Custom Ollama URL

If Ollama is running on a different port or host, update the `OLLAMA_BASE_URL` in the backend `.env` file.

## Security Notes

1. **Local Processing**: All AI analysis happens locally with Ollama
2. **No External Calls**: Financial data never leaves your local network
3. **Privacy Consent**: Users must explicitly consent to AI data usage
4. **Data Sanitization**: Personal identifiers are excluded from AI prompts

## Performance Notes

1. **Model Size**: Mistral is approximately 4GB
2. **Analysis Time**: Typically 5-30 seconds depending on data size
3. **Memory Usage**: Ollama requires sufficient RAM (4GB+ recommended)
4. **CPU Usage**: AI analysis is CPU-intensive

## Example AI Response

```
Suggestions:
1. Consider reducing your dining out expenses by 20% and redirecting those funds to your savings goal.
2. Your grocery spending has been consistent - try meal planning to optimize this budget further.

Question: Have you considered setting up automatic transfers to your savings account to make saving effortless?

Encouragement: Great job staying within your entertainment budget this month! You're building excellent financial discipline.
```
