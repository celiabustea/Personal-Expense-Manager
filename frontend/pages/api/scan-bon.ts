import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

// Helper function to get the temporary file path from formidable
const getFilePath = async (req: NextApiRequest): Promise<{ fields: any; files: any }> => {
  const form = formidable({ 
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024 // 10MB limit
  });
  
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
};

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Parse the multipart form data
    const { files } = await getFilePath(req);
    const receiptFile = files.receipt;
    
    if (!receiptFile) {
      return res.status(400).json({ success: false, message: 'No receipt file uploaded' });
    }

    // For demo purposes, simulate OCR extraction with a fake response
    // In a real implementation, you would connect to the backend OCR service
    
    // Get the backend URL from environment or default
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';

    // Prepare a dummy response for testing
    const dummyResponse = {
      success: true,
      data: {
        total: -25.99,
        store: 'Sample Store',
        date: new Date().toISOString(),
        items: [
          { name: 'Item 1', price: 10.99 },
          { name: 'Item 2', price: 15.00 }
        ]
      },
      message: 'Receipt processed successfully'
    };

    // In a real implementation, you would use the following code to forward the request to your backend:
    /*
    const formData = new FormData();
    formData.append('receipt', fs.createReadStream(receiptFile.filepath));

    const response = await fetch(`${backendUrl}/api/scan-receipt`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Backend server responded with ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
    */

    // Return the dummy response for now
    res.status(200).json(dummyResponse);
    
  } catch (error) {
    console.error('Receipt processing error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process receipt',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
