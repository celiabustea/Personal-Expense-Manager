import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

interface AIAnalysisRequest {
  exportData: string;
  format: 'csv' | 'json';
}

interface AIResponse {
  suggestions: string[];
  question: string;
  encouragement: string;
}

// Ollama API endpoint (default local installation)
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

/**
 * Analyzes financial data using Ollama/Mistral
 */
export const analyzeFinancialData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { exportData, format }: AIAnalysisRequest = req.body;

    if (!exportData) {
      res.status(400).json({ 
        success: false, 
        message: 'Export data is required' 
      });
      return;
    }

    // Prepare the prompt for Mistral
    const prompt = `You are a helpful financial assistant. Given the following financial data document in ${format.toUpperCase()} format, generate:
- Two personalized financial suggestions (numbered)
- One proactive question or insight (label as "Question" or "Insight")
- One encouragement if a budgeting goal was hit (label as "Encouragement", or leave blank if none)

Respond in plain text, for example:
Suggestions:
1. [specific suggestion based on the data]
2. [specific suggestion based on the data]
Question: [specific question or insight based on the data]
Encouragement: [encouragement if applicable, or leave blank]

Financial Data:
${exportData}`;

    // Call Ollama API
    const ollamaResponse = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: 'mistral',
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        num_predict: 300,
        stop: ['\n\n\n']
      }
    }, {
      timeout: 60000, // 60 seconds timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const aiResponse = ollamaResponse.data.response;
    
    // Parse the AI response
    const parsedResponse = parseAIResponse(aiResponse);

    res.json({
      success: true,
      data: parsedResponse,
      rawResponse: aiResponse
    });

  } catch (error: any) {
    console.error('AI Analysis Error:', error);
    
    // Handle specific Ollama errors
    if (error.code === 'ECONNREFUSED') {
      res.status(503).json({
        success: false,
        message: 'AI service is not available. Please ensure Ollama is running.',
        error: 'CONNECTION_REFUSED'
      });
      return;
    }

    if (error.response?.status === 404) {
      res.status(404).json({
        success: false,
        message: 'Mistral model not found. Please ensure the model is installed in Ollama.',
        error: 'MODEL_NOT_FOUND'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to analyze financial data',
      error: error.message
    });
  }
};

/**
 * Parses the AI response text into structured data
 */
function parseAIResponse(response: string): AIResponse {
  const result: AIResponse = {
    suggestions: [],
    question: '',
    encouragement: ''
  };

  try {
    const lines = response.split('\n').map(line => line.trim()).filter(line => line);
    
    let currentSection = '';
    
    for (const line of lines) {
      // Check for section headers
      if (line.toLowerCase().startsWith('suggestions:')) {
        currentSection = 'suggestions';
        continue;
      } else if (line.toLowerCase().startsWith('question:') || line.toLowerCase().startsWith('insight:')) {
        currentSection = 'question';
        const content = line.substring(line.indexOf(':') + 1).trim();
        if (content) {
          result.question = content;
        }
        continue;
      } else if (line.toLowerCase().startsWith('encouragement:')) {
        currentSection = 'encouragement';
        const content = line.substring(line.indexOf(':') + 1).trim();
        if (content) {
          result.encouragement = content;
        }
        continue;
      }
      
      // Process content based on current section
      if (currentSection === 'suggestions') {
        // Look for numbered items (1., 2., etc.)
        const match = line.match(/^\d+\.\s*(.+)/);
        if (match) {
          result.suggestions.push(match[1]);
        }
      } else if (currentSection === 'question' && !result.question) {
        result.question = line;
      } else if (currentSection === 'encouragement' && !result.encouragement) {
        result.encouragement = line;
      }
    }
    
    // Fallback: if no structured parsing worked, try to extract basic content
    if (result.suggestions.length === 0) {
      const suggestionMatches = response.match(/\d+\.\s*([^\n]+)/g);
      if (suggestionMatches) {
        result.suggestions = suggestionMatches.map(match => 
          match.replace(/^\d+\.\s*/, '')
        ).slice(0, 2); // Take first 2 suggestions
      }
    }
    
  } catch (error) {
    console.error('Error parsing AI response:', error);
  }
  
  return result;
}

/**
 * Health check for AI service
 */
export const checkAIServiceHealth = async (req: Request, res: Response): Promise<void> => {
  try {
    const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`, {
      timeout: 5000
    });
    
    const models = response.data.models || [];
    const mistralModel = models.find((model: any) => 
      model.name && model.name.toLowerCase().includes('mistral')
    );
    
    res.json({
      success: true,
      ollamaAvailable: true,
      mistralInstalled: !!mistralModel,
      availableModels: models.map((m: any) => m.name)
    });
    
  } catch (error: any) {
    console.error('AI Health Check Error:', error);
    
    res.json({
      success: false,
      ollamaAvailable: false,
      mistralInstalled: false,
      error: error.code === 'ECONNREFUSED' ? 'Ollama not running' : error.message
    });
  }
};
