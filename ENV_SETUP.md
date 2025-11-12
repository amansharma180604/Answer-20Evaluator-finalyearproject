# Answer Evaluator - Setup Guide

## Overview

The Answer Evaluator app is a modern interface for automatically grading student answers using semantic similarity analysis.

## Features

- **Semantic Similarity Scoring**: Compares student answers with model answers using embedding-based similarity
- **Instant Feedback**: Provides qualitative feedback based on the similarity score
- **No Database Required**: Completely stateless evaluation system
- **Professional Interface**: Modern, responsive UI with real-time results

## How It Works

1. **Input**: User provides:
   - Question (optional, for context)
   - Model Answer (reference answer)
   - Student Answer (to be evaluated)

2. **Processing**:
   - The app generates embeddings (semantic representations) of both answers
   - Computes cosine similarity between the embeddings
   - Converts similarity to a score (0-5)
   - Generates contextual feedback based on the score

3. **Output**:
   - **Score**: Numerical rating from 0 to 5
   - **Similarity**: Percentage match between answers (0-100%)
   - **Feedback**: Constructive comments about strengths and areas for improvement

## Configuration (Optional)

### Using HuggingFace API for Better Embeddings

For improved semantic similarity accuracy, you can optionally connect to the free HuggingFace Inference API:

1. Create a free account at [huggingface.co](https://huggingface.co)
2. Generate an API token in your account settings
3. Set the environment variable:
   ```
   HF_API_KEY=your_huggingface_api_key_here
   ```

**Without the API key**: The app uses a fallback algorithm based on word frequency and text characteristics. It still works well but may be less accurate than with proper embeddings.

### Running Locally

```bash
# Install dependencies
pnpm install

# Set environment variables (optional)
export HF_API_KEY=your_key_here

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Deployment

The app is production-ready and can be deployed to:
- **Netlify**: Using the Netlify MCP integration
- **Vercel**: Using the Vercel MCP integration
- **Any Node.js compatible platform**: Run `pnpm build && pnpm start`

## Examples

### Example 1: Operating Systems

**Question**: What are the functions of operating system?

**Model Answer**: "An operating system manages computer hardware and software resources. It provides services such as process management, memory management, file handling, and input/output control."

**Student Answer**: "Operating system helps to run computer smoothly. It controls memory and processor and allows the user to manage files and run programs."

**Expected Output**:
- Score: ~4.5/5
- Similarity: ~89%
- Feedback: "Good understanding of OS functions like memory and process management. Missing mention of I/O control and services. Overall, a well-structured answer."

### Example 2: Photosynthesis

**Question**: Explain photosynthesis.

**Model Answer**: "Photosynthesis is the process by which green plants use sunlight, carbon dioxide, and water to produce glucose and oxygen. It occurs in the chloroplasts containing chlorophyll."

**Student Answer**: "Photosynthesis happens when plants make food using light and water. Oxygen is also produced."

**Expected Output**:
- Score: ~3/5
- Similarity: ~60%
- Feedback: "Basic concept is correct but lacks details like carbon dioxide, glucose, and chloroplast. Try to include the chemical process explanation."

## Technical Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Express.js
- **Embeddings**: HuggingFace Inference API (optional) with fallback algorithm
- **Build Tool**: Vite
- **Testing**: Vitest

## Scoring Logic

The scoring system works as follows:

- **90-100% similarity**: Excellent answer (4.5-5.0/5)
- **80-89% similarity**: Very good answer (4.0-4.5/5)
- **70-79% similarity**: Good answer (3.5-4.0/5)
- **60-69% similarity**: Adequate answer (3.0-3.5/5)
- **50-59% similarity**: Partial understanding (2.0-3.0/5)
- **40-49% similarity**: Poor answer (1.0-2.0/5)
- **Below 40% similarity**: Inadequate answer (0.0-1.0/5)

## Troubleshooting

### "Failed to evaluate answer" error

1. Check that both model answer and student answer are provided
2. If using HuggingFace API, verify your API key is valid
3. Check browser console for detailed error messages
4. The app automatically falls back to basic similarity if API fails

### No visible results

- Ensure JavaScript is enabled in your browser
- Clear browser cache and refresh the page
- Check network tab in developer tools for API errors

## Future Enhancements

- Multi-language support for international assessments
- Rubric-based evaluation with custom criteria
- LLM-powered feedback generation (GPT-4/Gemini integration)
- Batch evaluation for multiple answers
- Answer evaluation history and analytics
- OCR support for handwritten answers
