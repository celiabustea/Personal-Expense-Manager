// Simple test script to verify AI integration
const testAIAnalysis = async () => {
  try {
    // Test data
    const sampleData = {
      exportData: `Financial Data Export
Export Date,7/28/2025
Total Transactions,3
Total Budgets,2

TRANSACTIONS
id,date,description,category,amount,currency,isRecurring,recurringFrequency
1,2025-07-28,Grocery Store,Food,-85.50,USD,false,
2,2025-07-27,Monthly Salary,Income,2500.00,USD,true,monthly
3,2025-07-26,Gas Station,Transportation,-45.00,USD,false,

BUDGETS
id,name,category,amount,limit,spent,currency
1,Food Budget,Food,400,400,85.50,USD
2,Transport Budget,Transportation,200,200,45.00,USD`,
      format: 'csv'
    };

    console.log('Testing AI health check...');
    const healthResponse = await fetch('http://localhost:5000/ai/health');
    const healthData = await healthResponse.json();
    console.log('Health check result:', healthData);

    if (healthData.ollamaAvailable && healthData.mistralInstalled) {
      console.log('Testing AI analysis...');
      const analysisResponse = await fetch('http://localhost:5000/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sampleData)
      });

      const analysisData = await analysisResponse.json();
      console.log('Analysis result:', analysisData);
    } else {
      console.log('AI service not ready. Please ensure Ollama is running and Mistral is installed.');
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
};

// Run the test
testAIAnalysis();
