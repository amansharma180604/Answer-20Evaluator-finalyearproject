# Python ML Backend Integration - Complete Guide

## What's New

Your Answer Evaluator app now has **two architectures**:

### ✅ JavaScript-Only Mode (Original)
- Works without Python
- Fast startup
- Good semantic similarity
- Rule-based feedback (basic)

### 🚀 Full ML Stack Mode (NEW)
- Node.js + Python backends
- Real semantic embeddings with sentence-transformers
- **LLM-powered feedback generation** using google/flan-t5-base
- Superior accuracy and natural language feedback
- Production-ready

---

## Project Structure

```
answer-evaluator/
├── client/                          # React frontend
│   ├── pages/
│   │   └── Index.tsx               # Main evaluation page
│   ├── components/
│   │   ├── EvaluationForm.tsx       # Form with backend status indicator
│   │   ├── Header.tsx
│   │   └── ui/                      # Reusable UI components
│   └── App.tsx
│
├── server/                          # Node.js/Express backend
│   ├── index.ts                    # Express server, routes
│   ├── routes/
│   │   ├── demo.ts
│   │   └── evaluate.ts             # Calls Python backend
│   └── utils/
│       └── embeddings.ts           # JS fallback
│
├── python-backend/                  # NEW: Python ML backend
│   ├── app.py                       # Flask application
│   ├── embeddings.py                # Semantic similarity (sentence-transformers)
│   ├── llm_feedback.py              # LLM feedback (flan-t5)
│   ├── requirements.txt             # Python dependencies
│   ├── run.sh / run.bat            # Startup scripts
│   ├── .env.example
│   ├── .gitignore
│   └── README.md
│
├── shared/                          # Types shared between Node & browser
│   └── api.ts
│
├── SETUP_GUIDE.md                  # Complete setup instructions
├── PYTHON_INTEGRATION.md           # This file
├── ENV_SETUP.md
├── package.json
└── vite.config.ts
```

---

## How It Works

### Request Flow with Python Backend

```
1. User fills form in React
2. Browser sends POST /api/evaluate to Express server
3. Express checks Python backend availability
4. Express proxies to Python backend:
   - Generates embeddings (sentence-transformers)
   - Computes similarity score
   - Generates LLM feedback (flan-t5)
5. Returns results to React
6. React displays score + feedback
```

### Fallback Flow (No Python)

```
1. User fills form in React
2. Browser sends POST /api/evaluate to Express server
3. Python backend unreachable
4. Express uses JavaScript fallback:
   - Basic similarity algorithm
   - Rule-based feedback
5. Returns results to React
```

---

## Installation & Running

### 🎯 Quick Start (Recommended)

**Terminal 1 - Start Node.js + React:**
```bash
# Project root
pnpm install
pnpm dev

# Open http://localhost:5173
```

**Terminal 2 - Start Python Backend:**
```bash
cd python-backend

# Linux/macOS
chmod +x run.sh
./run.sh

# Windows
run.bat
```

That's it! The app will automatically use Python backend when available.

---

## Detailed Setup

### A. Node.js Backend & Frontend (5 minutes)

```bash
# 1. Install Node dependencies
pnpm install

# 2. Start dev server (runs on port 8080 + 5173)
pnpm dev

# Visit http://localhost:5173
```

**Works without Python!** You can use the JavaScript fallback.

### B. Python ML Backend (15-20 minutes including model download)

**Required:**
- Python 3.8+
- 8GB RAM minimum
- 2GB disk space

**Installation:**

**Linux/macOS:**
```bash
cd python-backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install packages (first time: ~5-10 minutes)
pip install -r requirements.txt

# Run
./run.sh
```

**Windows (PowerShell):**
```powershell
cd python-backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
.\run.bat
```

**Windows (Command Prompt):**
```cmd
cd python-backend
python -m venv venv
venv\Scripts\activate.bat
pip install -r requirements.txt
run.bat
```

---

## What Gets Downloaded

First run of Python backend downloads models:

| Model | Size | Purpose |
|-------|------|---------|
| sentence-transformers | ~90MB | Text embeddings |
| flan-t5-base | ~900MB | Feedback generation |
| Other libraries | ~500MB | Dependencies cache |
| **Total** | **~2GB** | One-time download |

After first run, everything is cached and loads instantly.

---

## Testing

### 1. Check Backend Status

```bash
# Node.js server
curl http://localhost:8080/api/ping

# Backend availability
curl http://localhost:8080/api/backend-status

# Python backend (if running)
curl http://localhost:5000/health
```

### 2. Test Evaluation

**Via Browser:**
1. Open http://localhost:5173
2. Look for backend status indicator (top of form)
   - 🟢 "Enhanced AI Mode" = Python backend connected
   - ⚪ "JavaScript Fallback Mode" = JS fallback
3. Fill in answers
4. Click "Evaluate Answer"

**Via cURL:**
```bash
curl -X POST http://localhost:8080/api/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is photosynthesis?",
    "modelAnswer": "Process by which plants convert light to chemical energy using sunlight, water, and CO2",
    "studentAnswer": "Plants use sunlight to make food and produce oxygen"
  }'
```

**Expected Response:**
```json
{
  "score": 4.2,
  "similarity": 0.84,
  "feedback": "Very good answer with strong understanding of the main points. Consider adding more specific details about carbon dioxide and glucose production."
}
```

---

## Feedback Quality Comparison

### Without Python (JavaScript Fallback)
```
Score: 3.5 / 5
Feedback: "Your answer captures the basic idea but lacks 
some important details. Review the key concepts and try 
to include more specific information."
```
- ✅ Rule-based but clear
- ❌ Generic feedback
- ✅ Fast
- ❌ Limited understanding

### With Python (LLM-Powered)
```
Score: 3.5 / 5
Feedback: "Good understanding of photosynthesis basics, 
but you're missing the key inputs: carbon dioxide from 
air and water from soil. Also mention glucose and oxygen 
as products, plus chloroplast as the location."
```
- ✅ Natural language
- ✅ Specific to answer
- ✅ Constructive suggestions
- ❌ Slightly slower (3-10s)

---

## Architecture Decisions

### Why Python?

1. **Industry Standard for ML**
   - sentence-transformers (best embeddings)
   - Transformers library (access to any HuggingFace model)

2. **Deep Learning**
   - Not just word matching
   - Understands semantic meaning
   - Works with paraphrases and synonyms

3. **LLM Integration**
   - Google Flan-T5 is free & open-source
   - Instruction-tuned (good at following prompts)
   - Works offline

4. **Flexibility**
   - Easy to swap models
   - Can fine-tune for specific domains
   - Batch processing

### Why Keep Node.js?

1. **Web Server**
   - Handles HTTP requests from browser
   - Serves React frontend
   - Acts as API gateway

2. **Graceful Degradation**
   - Works without Python
   - JavaScript fallback
   - No forced dependencies

3. **Deployment**
   - Deploy frontend + Node to Netlify/Vercel
   - Python optional for enhanced accuracy
   - Scales better

---

## Performance Characteristics

### Semantic Similarity (sentence-transformers)
- **Time**: ~100ms per evaluation
- **Memory**: ~500MB
- **Accuracy**: Excellent (understands paraphrases)

### LLM Feedback (flan-t5-base)
- **Time**: 3-10 seconds per evaluation
- **Memory**: 4-6GB
- **Quality**: High (natural language)

### Total Pipeline
- **First evaluation**: 5-10 seconds (model load)
- **Subsequent**: 4-11 seconds
- **With GPU**: 1-3 seconds

---

## Environment Variables

### Node.js Backend
Create `.env` in project root:
```bash
PYTHON_BACKEND_URL=http://localhost:5000
HF_API_KEY=hf_...  # Optional (for faster model downloads)
```

### Python Backend
Create `python-backend/.env`:
```bash
FLASK_ENV=development
FLASK_DEBUG=False
PYTHON_BACKEND_URL=http://localhost:5000
```

---

## Troubleshooting

### "Port already in use"

```bash
# Find process on port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill process or use different port
export FLASK_PORT=5001
python app.py
```

### "No module named 'sentence_transformers'"

```bash
# Make sure virtual environment is activated
source python-backend/venv/bin/activate  # Linux/macOS
python-backend\venv\Scripts\activate  # Windows

pip install -r python-backend/requirements.txt
```

### "Models downloading very slowly"

Download manually once:
```bash
python3 << 'EOF'
from sentence_transformers import SentenceTransformer
from transformers import AutoModelForSeq2SeqLM

print("Downloading sentence-transformers...")
SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

print("Downloading flan-t5...")
AutoModelForSeq2SeqLM.from_pretrained('google/flan-t5-base')

print("Done!")
EOF
```

### "Out of memory"

Python backend is memory-intensive. Options:

1. **Use lighter LLM:**
   Edit `python-backend/llm_feedback.py`:
   ```python
   MODEL_NAME = "google/flan-t5-small"  # 300MB vs 900MB
   ```

2. **Use CPU only:**
   ```bash
   unset CUDA_VISIBLE_DEVICES
   python app.py
   ```

3. **Reduce batch size**

4. **Upgrade system RAM**

---

## Deployment

### Development
```bash
# Terminal 1
pnpm dev

# Terminal 2
cd python-backend && ./run.sh
```

### Production

#### Option 1: Netlify (Frontend) + AWS/Heroku (Backend)
```bash
# Build
pnpm build

# Deploy frontend to Netlify
# Deploy python backend to Heroku/AWS
```

#### Option 2: Docker Compose
```yaml
version: '3'
services:
  frontend:
    build: .
    ports: ["5173:5173"]
  
  python-backend:
    build: ./python-backend
    ports: ["5000:5000"]
```

#### Option 3: Single Server
```bash
pnpm build
pnpm start &  # Run in background
cd python-backend && python app.py
```

---

## Advanced: Fine-Tuning for Your Domain

### Custom Training Data

You can fine-tune models on your specific domain:

```python
# python-backend/fine_tune.py
from transformers import AutoModelForSeq2SeqLM, Seq2SeqTrainer
# Custom training code here
```

This improves feedback quality for specific topics (e.g., biology, mathematics).

---

## Comparisons

### vs. Proprietary LLM APIs (OpenAI, etc.)

| Feature | Our Solution | APIs |
|---------|-------------|------|
| Cost | Free | $0.01-0.10 per eval |
| Offline | ✅ | ❌ |
| Privacy | ✅ | ❌ |
| Customizable | ✅ | ❌ |
| Speed | 3-10s | 1-3s |
| Quality | Good | Excellent |

### vs. Rubric-Based Systems

| Feature | Our Solution | Rubric |
|---------|-------------|--------|
| Semantic Understanding | ✅ | ❌ |
| Catches Synonyms | ✅ | ❌ |
| Natural Feedback | ✅ | ❌ |
| Setup Time | 20min | Hours |
| Customizable | ✅ | ✅ |

---

## Next Steps

1. ✅ **Complete setup** following this guide
2. ✅ **Test both scenarios** (with/without Python)
3. ✅ **Configure environment** (.env files)
4. ✅ **Deploy** to your hosting platform
5. 📊 **Monitor** performance and feedback quality
6. 🔄 **Fine-tune** models on real evaluation data (optional)

---

## Support & Resources

- **Setup Issues**: Check SETUP_GUIDE.md
- **Python Backend**: See python-backend/README.md
- **Model Details**: Visit HuggingFace.co
- **Errors**: Check Flask logs in terminal

Happy evaluating! 🎓🤖
