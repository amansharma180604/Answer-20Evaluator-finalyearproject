# Answer Evaluator - Python ML Backend

Production-ready Python backend for semantic similarity and LLM-based feedback generation.

## Features

✅ **Semantic Similarity** - Using sentence-transformers embeddings  
✅ **LLM Feedback** - Powered by google/flan-t5-base  
✅ **Fast & Lightweight** - Optimized models  
✅ **Batch Processing** - Evaluate multiple answers at once  
✅ **Easy Integration** - Simple REST API  

## Quick Start

### Prerequisites
- Python 3.8+
- 8GB+ RAM recommended
- ~2GB disk space for models

### Installation

**Linux/macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
./run.sh
```

**Windows:**
```cmd
python -m venv venv
venv\Scripts\activate.bat
pip install -r requirements.txt
run.bat
```

### First Run
⏳ First startup downloads ~2GB of models (5-10 minutes). Subsequent runs are instant.

## API Endpoints

### POST `/api/evaluate`
Evaluate a single answer.

**Request:**
```json
{
  "question": "What is photosynthesis?",
  "modelAnswer": "The process by which plants convert light to chemical energy...",
  "studentAnswer": "Plants use sunlight to make food."
}
```

**Response:**
```json
{
  "success": true,
  "score": 4.2,
  "similarity": 0.84,
  "similarity_percentage": 84.0,
  "feedback": "Very good answer with strong understanding..."
}
```

### POST `/api/batch-evaluate`
Evaluate multiple answers.

**Request:**
```json
{
  "evaluations": [
    {
      "question": "...",
      "modelAnswer": "...",
      "studentAnswer": "..."
    },
    ...
  ]
}
```

**Response:**
```json
{
  "success": true,
  "total": 2,
  "results": [
    { "success": true, "score": 4.2, ... },
    { "success": true, "score": 3.8, ... }
  ]
}
```

### GET `/health`
Check backend health and model status.

**Response:**
```json
{
  "status": "ok",
  "embeddings_model_ready": true,
  "llm_model_ready": true
}
```

### GET `/api/models`
Get information about loaded models.

**Response:**
```json
{
  "embeddings_ready": true,
  "llm_ready": true,
  "embeddings_model": "sentence-transformers/all-MiniLM-L6-v2",
  "llm_model": "google/flan-t5-base"
}
```

## Models

### Embeddings: sentence-transformers/all-MiniLM-L6-v2
- **Size**: ~90MB
- **Speed**: ~100ms per pair
- **Accuracy**: Excellent for semantic similarity
- **Uses**: Comparing answer meaning, not exact words

### LLM: google/flan-t5-base
- **Size**: ~900MB
- **Speed**: 3-10 seconds per evaluation
- **Quality**: High-quality instruction-tuned feedback
- **Uses**: Generating natural language feedback

## Configuration

Edit `.env` file:
```bash
FLASK_ENV=development    # Set to 'production' for deployment
FLASK_DEBUG=False        # Disable debug mode in production
PYTHON_BACKEND_URL=http://localhost:5000
```

## Performance Tuning

### Use Lighter Models
Edit `llm_feedback.py`:
```python
MODEL_NAME = "google/flan-t5-small"  # Faster, lighter
```

### Use GPU
If you have NVIDIA GPU:
```bash
pip install torch --index-url https://download.pytorch.org/whl/cu118
```

The app auto-detects GPU and uses it if available.

### Pre-download Models
Avoid first-run delay by pre-downloading:
```bash
python3 -c "from transformers import AutoModel; AutoModel.from_pretrained('google/flan-t5-base')"
python3 -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')"
```

## Troubleshooting

### "CUDA out of memory"
Reduce batch size or use CPU-only:
```bash
unset CUDA_VISIBLE_DEVICES
```

### Models not downloading
Check internet connection and HuggingFace access.

### Slow feedback generation
Normal for CPU. Consider:
- Using lighter model (flan-t5-small)
- Upgrading to GPU
- Increasing timeout in Node.js backend

## Deployment

### Docker
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "app.py"]
```

### Heroku
```bash
git push heroku main
heroku config:set FLASK_ENV=production
```

### AWS Lambda
Use serverless-flask or convert to AWS Lambda handler.

## Architecture

```
Flask App
├── /api/evaluate (single)
├── /api/batch-evaluate (multiple)
├── /health (status)
└── /api/models (info)
    │
    ├── embeddings.py
    │   ├── sentence-transformers model
    │   └── cosine similarity
    │
    └── llm_feedback.py
        ├── flan-t5 model
        └── prompt engineering
```

## License

Same as main project.

## Support

For issues:
1. Check SETUP_GUIDE.md in project root
2. Review logs for error messages
3. Verify Python/package versions
4. Check disk space for models
