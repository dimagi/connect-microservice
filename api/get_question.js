const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// Authenticate request using API key
function authenticate(req) {
  const apiKey = process.env.API_KEY;

  // If no API key is configured, skip authentication (for local dev)
  if (!apiKey) {
    return true;
  }

  // Check common header names for API key
  // The header name is configurable in Open Chat Studio
  const providedKey =
    req.headers['x-api-key'] ||
    req.headers['authorization']?.replace('Bearer ', '') ||
    req.headers['api-key'];

  return providedKey === apiKey;
}

// Load and parse CSV file for a given form_id
function loadQuestions(formId) {
  // Sanitize form_id to prevent directory traversal
  const sanitizedFormId = formId.replace(/[^a-zA-Z0-9_-]/g, '');

  // Look for form-specific file first, fall back to default questions.csv
  const formSpecificPath = path.join(process.cwd(), 'data', `${sanitizedFormId}.csv`);
  const defaultPath = path.join(process.cwd(), 'data', 'questions.csv');

  let csvPath;
  if (fs.existsSync(formSpecificPath)) {
    csvPath = formSpecificPath;
  } else if (fs.existsSync(defaultPath)) {
    csvPath = defaultPath;
  } else {
    return null;
  }

  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  return records;
}

// Find question by form_id and question_number
function findQuestion(formId, questionNumber) {
  const questions = loadQuestions(formId);

  if (!questions) {
    return { error: 'Form not found', code: 404 };
  }

  // Find the question - support question_id or question_number column
  const question = questions.find(q => {
    const qNum = String(q.question_id || q.question_number);
    return qNum === String(questionNumber);
  });

  if (!question) {
    return { error: 'Question not found', code: 404 };
  }

  return { data: question, code: 200 };
}

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key, Api-Key');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Authenticate
  if (!authenticate(req)) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing API key'
    });
  }

  // Extract parameters from query string or body
  let formId, questionNumber;

  if (req.method === 'GET') {
    formId = req.query.form_id;
    questionNumber = req.query.question_number;
  } else if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    formId = body.form_id;
    questionNumber = body.question_number;
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Default form_id to 'questions' if not provided (uses questions.csv)
  if (!formId) {
    formId = 'questions';
  }

  // Validate required parameters
  if (questionNumber === undefined || questionNumber === null) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Missing required parameter: question_number'
    });
  }

  // Find and return the question
  const result = findQuestion(formId, questionNumber);

  if (result.error) {
    return res.status(result.code).json({
      error: result.error,
      form_id: formId,
      question_number: questionNumber
    });
  }

  return res.status(200).json(result.data);
};
