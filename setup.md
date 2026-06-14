# Office AI Setup

This guide explains how to install and run the Office AI FastAPI backend and
React frontend.

## Requirements

Install the following tools:

- Python 3.11 or newer
- Node.js 20 or newer
- npm
- A Google Gemini API key

Create a Gemini API key from
[Google AI Studio](https://aistudio.google.com/app/apikey).

## 1. Backend Setup

Open PowerShell in the project root and create a Python virtual environment:

```powershell
python -m venv .venv
```

Activate it:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install the backend dependencies:

```powershell
python -m pip install -r backend\requirements.txt
```

Create the backend environment file if it does not already exist:

```powershell
Copy-Item backend\.env.example backend\.env
```

Open `backend/.env` and configure it:

```dotenv
GOOGLE_API_KEY=your_real_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
FRONTEND_ORIGINS=http://localhost:5173
MAX_INPUT_CHARACTERS=50000
```

Do not commit `backend/.env` or expose the Gemini API key in frontend code.

Start the backend:

```powershell
cd backend
uvicorn app.main:app --reload --port 8000
```

The backend will run at:

```text
http://localhost:8000
```

FastAPI documentation is available at:

```text
http://localhost:8000/docs
```

## 2. Frontend Setup

Open a second PowerShell terminal and enter the frontend directory:

```powershell
cd frontend
```

Install the frontend dependencies:

```powershell
npm install
```

The default backend URL is `http://localhost:8000`. To use a different URL,
create a frontend environment file:

```powershell
Copy-Item .env.example .env
```

Then update `frontend/.env`:

```dotenv
VITE_API_URL=http://localhost:8000
```

Start the React development server:

```powershell
npm run dev
```

Open Office AI at:

```text
http://localhost:5173
```

## 3. Running Both Services

Office AI requires both processes to remain running:

```text
Backend:  http://localhost:8000
Frontend: http://localhost:5173
```

The frontend status indicator will show **Gemini ready** when the backend is
available and the Gemini API key is configured.

## 4. Run Backend Tests

From the project root:

```powershell
.\.venv\Scripts\python.exe -m pytest backend\tests -q
```

## 5. Build the Frontend

From the `frontend` directory:

```powershell
npm run build
```

The production frontend files will be generated in `frontend/dist`.

To preview the production build:

```powershell
npm run preview
```

## Common Problems

### Setup needed appears in the frontend

Confirm that:

- The FastAPI backend is running on port `8000`.
- `GOOGLE_API_KEY` is set in `backend/.env`.
- `VITE_API_URL` points to the correct backend URL.
- `FRONTEND_ORIGINS` contains the frontend URL.

### PowerShell blocks virtual environment activation

Run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

### The frontend cannot connect to FastAPI

Check that the backend terminal is still running, then open:

```text
http://localhost:8000/api/health
```

It should return a JSON response containing `"status": "ok"`.

