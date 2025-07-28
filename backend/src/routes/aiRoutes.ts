import { Router } from 'express';
import { analyzeFinancialData, checkAIServiceHealth } from '../controllers/aiController';
import { body } from 'express-validator';

const router = Router();

// AI analysis endpoint
router.post('/analyze', [
  body('exportData').notEmpty().withMessage('Export data is required'),
  body('format').isIn(['csv', 'json']).withMessage('Format must be csv or json')
], analyzeFinancialData);

// AI service health check
router.get('/health', checkAIServiceHealth);

export default router;
