# Answer Evaluator - Complete Setup Guide

A production-ready AI-powered answer evaluation system combining:
- **Node.js/Express** frontend and API gateway
- **Python/Flask** ML backend with semantic similarity and LLM feedback
- **Modern React UI** for evaluation interface

## 🎯 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   React Frontend (Vite)                      │
│              (client/ - localhost:5173)                      │
└────────��───────────────────┬────────────────────────────────┘
                             │ HTTP requests
                             ▼
┌─────────────────────────────────────────────────────────────┐
│           Express.js Backend (server/ - :8080)              │
│  - Routes user requests                                      │
│  - API gateway                                               │
│  - Falls back to JavaScript if Python unavailable           │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP requests (optional)
                             ▼
┌─────────────────────────────────────────────────────────────┐
│        Python/Flask ML Backend (python-backend/ - :5000)    │
│  - Semantic similarity (sentence-transformers)              │
│  - LLM feedback generation (google/flan-t5-base)            │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Prerequisites

### System Requirements
- **OS**: Linux, macOS, or Windows
- **RAM**: 8GB minimum (16GB recommended for ML models)
- **Storage**: 5GB free space (for Python models)

### Required Software
- **Node.js** v16+ ([download](https://nodejs.org))
- **Python** 3.8+ ([download](https://www.python.org))
- **Git** ([download](https://git-scm.com))

### Verify Installation
```bash
node --version      # Should be v16 or higher
python3 --version   # Should be 3.8 or higher
git --version       # Should show version info
```

## 🚀 Quick Start (All-in-One)

### Option 1: Run Everything (Recommended)

#### Linux/macOS

```bash
# 1. Clone repository
git clone <your-repo-url>
cd Answer-Evaluator

# 2. Start Node.js backend and frontend (Terminal 1)
pnpm install
pnpm dev

# 3. In a new terminal (Terminal 2), start Python backend
cd python-backend
chmod +x run.sh
./run.sh
```

#### Windows

```cmd
REM 1. Clone repository
git clone <your-repo-url>
cd Answer-Evaluator

REM 2. Start Node.js backend and frontend (Terminal 1)
pnpm install
pnpm dev

REM 3. In a new terminal (Terminal 2), start Python backend
cd python-backend
run.bat
```

### Option 2: Node.js Only (Without Python ML Backend)

If you don't want to install Python, the app works with JavaScript fallback:

```bash
pnpm install
pnpm dev
```

The JavaScript implementation provides good semantic similarity but without LLM feedback.

---

## 📚 Detailed Setup

### Part 1: Node.js / JavaScript Backend & Frontend

#### Step 1: Install Node Dependencies
```bash
# In project root
pnpm install
```

This installs:
- React, Vite, TailwindCSS (frontend)
- Express.js (API server)
- sentence-transformers bridge (optional fallback)

#### Step 2: Configure Environment (Optional)

Create `.env` file in project root:
```bash
PYTHON_BACKEND_URL=http://localhost:5000
HF_API_KEY=your_huggingface_api_key  # Optional
```

#### Step 3: Start Development Server
```bash
pnpm dev
```

**Output:**
```
VITE v7.1.2 ready in 200ms

➜  Local:   http://localhost:5173/
➜  press h + enter to show help
```

Your app is now running at **http://localhost:5173**

---

### Part 2: Python ML Backend (Recommended for Better Accuracy)

#### Step 1: Navigate to Python Backend
```bash
cd python-backend
```

#### Step 2: Setup Python Environment

**Linux/macOS:**
```bash
# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate

# Install dependencies (first time ~5-10 minutes)
pip install -r requirements.txt
```

**Windows (PowerShell):**
```powershell
# Create virtual environment
python -m venv venv

# Activate it
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

**Windows (Command Prompt):**
```cmd
# Create virtual environment
python -m venv venv

# Activate it
venv\Scripts\activate.bat

# Install dependencies
pip install -r requirements.txt
```

#### Step 3: Configure Environment (Optional)

Create `.env` in `python-backend/`:
```bash
FLASK_ENV=development
FLASK_DEBUG=False
PYTHON_BACKEND_URL=http://localhost:5000
```

#### Step 4: Run Python Backend

**Linux/macOS:**
```bash
chmod +x run.sh
./run.sh
```

**Windows:**
```cmd
run.bat
```

Or manually:
```bash
source venv/bin/activate  # Linux/macOS
python app.py
```

**Expected Output:**
```
🚀 Starting Answer Evaluator Flask Backend
✅ Python version: Python 3.10.x
🔌 Activating virtual environment...
📚 Installing dependencies...
🎯 Starting Flask application on http://localhost:5000
...
Downloading sentence-transformers models... (first time only)
✅ Models loaded successfully
 * Running on http://127.0.0.1:5000/
```

⏳ **First time setup takes 5-10 minutes** as models download (~2GB).

---

## 🧪 Testing the Setup

### Check All Endpoints

```bash
# Node.js server status
curl http://localhost:8080/api/ping

# Backend status (includes Python availability)
curl http://localhost:8080/api/backend-status

# Python backend health (if running)
curl http://localhost:5000/health
```

### Test Evaluation

**Via cURL:**
```bash
curl -X POST http://localhost:8080/api/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is photosynthesis?",
    "modelAnswer": "Photosynthesis is the process by which plants convert light energy into chemical energy.",
    "studentAnswer": "Plants use sunlight to make food through photosynthesis."
  }'
```

**Via Browser:**
1. Open http://localhost:5173
2. Fill in the form with answers
3. Click "Evaluate Answer"
4. See results with score and feedback

---

## 📦 Model Details

### Embeddings Model
- **Name**: `sentence-transformers/all-MiniLM-L6-v2`
- **Size**: ~90MB
- **Purpose**: Convert text to semantic vectors
- **Accuracy**: Good for comparing semantic similarity
- **Speed**: Very fast (~100ms per pair)

### LLM for Feedback
- **Name**: `google/flan-t5-base`
- **Size**: ~900MB
- **Purpose**: Generate natural language feedback
- **Quality**: High-quality, instruction-tuned
- **Speed**: Slower (~3-10 seconds depending on system)

**Alternative Models** (edit `python-backend/llm_feedback.py` to use):
```python
# Lighter/faster:
MODEL_NAME = "google/flan-t5-small"  # ~300MB, 2x faster

# Better quality:
MODEL_NAME = "google/flan-t5-large"  # ~3GB, better accuracy
```

---

## 🔧 Running in Production

### Option 1: Build and Run

```bash
# Build both frontend and backend
pnpm build

# Start production server
pnpm start
```

### Option 2: Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm build
EXPOSE 8080
CMD ["pnpm", "start"]
```

Build and run:
```bash
docker build -t answer-evaluator .
docker run -p 8080:8080 answer-evaluator
```

### Option 3: Deploy to Netlify/Vercel

1. Push to GitHub
2. Connect via Netlify/Vercel UI
3. Set environment variables
4. Auto-deploy on push

---

## 🛠️ Troubleshooting

### "Port already in use"
```bash
# Find process using port 5173
lsof -i :5173  # macOS/Linux
netstat -ano | findstr :5173  # Windows

# Kill process or use different port
PORT=3000 pnpm dev
```

### "ModuleNotFoundError: No module named 'flask'"

```bash
# Activate virtual environment
source python-backend/venv/bin/activate  # Linux/macOS
python-backend\venv\Scripts\activate.bat  # Windows

# Install dependencies
pip install -r python-backend/requirements.txt
```

### "Python backend unavailable"

This is normal - the system falls back to JavaScript. To fix:
1. Ensure Python backend is running on port 5000
2. Check firewall settings
3. Verify PYTHON_BACKEND_URL environment variable

### Models Taking Long to Download

First run downloads ~2GB of models. This is normal and happens only once:
- sentence-transformers model: ~90MB
- flan-t5 model: ~900MB
- Transformers cache: ~1GB

Solutions:
- Use lighter models (edit llm_feedback.py)
- Pre-download models before first run
- Increase timeout in evaluate.ts

### Out of Memory Error

If you get OOM errors:
1. Close other applications
2. Use smaller models:
   ```python
   # In python-backend/llm_feedback.py
   MODEL_NAME = "google/flan-t5-small"  # Lighter model
   ```
3. Increase system RAM or use cloud deployment

---

## 📊 System Requirements by Component

| Component | RAM | Storage | CPU |
|-----------|-----|---------|-----|
| Node.js frontend | 500MB | 100MB | Minimal |
| Express backend | 200MB | 50MB | Minimal |
| Sentence-transformers | 2GB | 90MB | 1+ cores |
| Flan-T5 LLM | 4-6GB | 900MB | 2+ cores |
| **Total** | **8GB+** | **2GB+** | **2+ cores** |

---

## 🚀 Performance Tips

### Faster Startup
1. Use smaller LLM:
   ```python
   MODEL_NAME = "google/flan-t5-small"
   ```

2. Pre-download models:
   ```bash
   python3 -c "from transformers import AutoModel; AutoModel.from_pretrained('google/flan-t5-base')"
   ```

### Faster Evaluations
1. Use GPU if available (automatically detected):
   ```bash
   # Check GPU
   python3 -c "import torch; print(torch.cuda.is_available())"
   ```

2. Enable model caching
3. Batch evaluations when possible

---

## 📖 API Documentation

### POST /api/evaluate

**Request:**
```json
{
  "question": "What is photosynthesis?",
  "modelAnswer": "Reference answer text...",
  "studentAnswer": "Student's answer text..."
}
```

**Response:**
```json
{
  "score": 4.2,
  "similarity": 0.84,
  "feedback": "Very good answer with strong understanding..."
}
```

---

## 🆘 Getting Help

- **Installation Issues**: Check Python/Node versions
- **Model Download Issues**: Check internet connection
- **Performance Issues**: Check RAM and CPU usage
- **Feedback Quality**: Consider using larger models

---

## 📝 Next Steps

1. ✅ Complete setup following this guide
2. ✅ Test with sample answers
3. ✅ Deploy to production
4. ✅ Fine-tune on your specific domain (optional)

Happy evaluating! 🎓
