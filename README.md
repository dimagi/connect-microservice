# Connect Microservice

A lightweight microservice that serves questions from CSV files. Designed to be used as a custom tool endpoint for LLM applications.

## How It Works

This service reads questions from CSV files in the `data/` directory and returns them via an API endpoint. When you update the CSV files and push to GitHub, Vercel automatically deploys the changes.

---

## For Non-Technical Users: How to Update Questions

### Step 1: Navigate to the CSV File

1. Go to the GitHub repository
2. Click on the `data` folder
3. Click on the CSV file you want to edit (e.g., `questions.csv`)

### Step 2: Edit the File

1. Click the **pencil icon** (Edit this file) in the top-right corner
2. Make your changes to the CSV content
3. The format is: `question_id,question_text,question_type`

### Step 3: Save Your Changes

1. Scroll down to "Commit changes"
2. Add a brief description of what you changed (e.g., "Updated question 3 text")
3. Click **"Commit changes"**

**That's it!** Your changes will automatically deploy within a few minutes.

### CSV Format

The CSV file should have these columns:

| Column | Description |
|--------|-------------|
| `question_id` | A unique number for each question (1, 2, 3, etc.) |
| `question_text` | The full text of the question |
| `question_type` | The type of question (e.g., "Open-ended", "Yes/No", etc.) |

**Example:**
```csv
question_id,question_text,question_type
1,What is your name?,Open-ended
2,Do you agree with the statement?,Yes/No
3,How satisfied are you?,Multiple choice
```

### Adding Questions for Different Forms

To create questions for a different form, create a new CSV file named after the form:
- `data/patient_intake.csv` → accessed with `form_id=patient_intake`
- `data/chw_visit.csv` → accessed with `form_id=chw_visit`

If no `form_id` is specified, the default `questions.csv` is used.

---

## API Usage

### Endpoint

```
GET /api/get_question?form_id=<form_id>&question_number=<number>
POST /api/get_question
```

### Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `form_id` | No | The form identifier (defaults to "questions") |
| `question_number` | Yes | The question number to retrieve |

### Authentication

Include your API key in one of these headers:
- `X-API-Key: your-api-key`
- `Authorization: Bearer your-api-key`
- `Api-Key: your-api-key`

### Example Request

```bash
curl -H "X-API-Key: your-api-key" \
  "https://your-app.vercel.app/api/get_question?form_id=questions&question_number=1"
```

### Example Response

```json
{
  "question_id": "1",
  "question_text": "What are your impressions of the organization?",
  "question_type": "Open-ended (exploratory)"
}
```

---

## Deployment Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or higher
- [Vercel CLI](https://vercel.com/cli): `npm install -g vercel`
- [GitHub CLI](https://cli.github.com/): `brew install gh`

### Initial Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/dimagi/connect-microservice.git
   cd connect-microservice
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Link to Vercel (first time only):**
   ```bash
   vercel link
   ```
   - Select your Vercel account/team
   - Link to an existing project or create a new one

4. **Set the API key environment variable:**
   ```bash
   vercel env add API_KEY
   ```
   - Select all environments (Production, Preview, Development)
   - Enter your chosen API key

5. **Deploy:**
   ```bash
   vercel --prod
   ```

### Setting Up Auto-Deploy from GitHub

1. Go to [vercel.com](https://vercel.com) and log in
2. Click "Add New Project"
3. Import the `dimagi/connect-microservice` repository
4. Vercel will automatically detect the configuration
5. Add the `API_KEY` environment variable in the project settings
6. Click "Deploy"

Now every push to the `main` branch will automatically deploy!

### Local Development

```bash
# Install dependencies
npm install

# Run locally (no API key required in dev mode)
vercel dev
```

Test locally:
```bash
curl "http://localhost:3000/api/get_question?question_number=1"
```

---

## Custom Tool Configuration

To use this as a custom tool in Open Chat Studio or similar platforms:

**Tool Name:** `get_question`

**Description:** Retrieves a specific question from the question bank.

**Parameters:**
- `form_id` (string, optional): The form identifier
- `question_number` (integer, required): The question number to retrieve

**Endpoint:** `https://your-app.vercel.app/api/get_question`

**Authentication:** API Key (configure header as `X-API-Key`)
