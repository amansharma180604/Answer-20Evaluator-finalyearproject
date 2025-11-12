"""
Flask backend for Answer Evaluator
Handles semantic similarity and LLM-based feedback
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import logging
from typing import Dict, Any

from embeddings import compute_similarity, is_model_ready as is_embeddings_ready
from llm_feedback import generate_feedback, is_model_ready as is_llm_ready

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'embeddings_model_ready': is_embeddings_ready(),
        'llm_model_ready': is_llm_ready(),
    }), 200


@app.route('/api/evaluate', methods=['POST'])
def evaluate():
    """
    Evaluate a student's answer
    
    Request JSON:
    {
        "question": "optional question text",
        "modelAnswer": "reference answer",
        "studentAnswer": "student's answer"
    }
    
    Response JSON:
    {
        "score": 4.5,
        "similarity": 0.89,
        "feedback": "detailed feedback text",
        "similarity_percentage": 89.0,
        "success": true
    }
    """
    try:
        data = request.get_json()
        
        # Validate input
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        model_answer = data.get('modelAnswer', '').strip()
        student_answer = data.get('studentAnswer', '').strip()
        question = data.get('question', '').strip()
        
        if not model_answer or not student_answer:
            return jsonify({
                'error': 'Missing required fields: modelAnswer and studentAnswer'
            }), 400
        
        # Check minimum length
        if len(model_answer) < 10 or len(student_answer) < 5:
            return jsonify({
                'error': 'Answers must be at least 5-10 characters long'
            }), 400
        
        logger.info(f"Processing evaluation request - Q: {len(question)} chars, Model: {len(model_answer)} chars, Student: {len(student_answer)} chars")
        
        # Compute semantic similarity
        similarity, metrics = compute_similarity(model_answer, student_answer)
        
        # Generate feedback
        feedback = generate_feedback(
            question=question,
            model_answer=model_answer,
            student_answer=student_answer,
            similarity_score=similarity
        )
        
        response = {
            'success': True,
            'score': metrics['score'],
            'similarity': metrics['semantic_similarity'],
            'similarity_percentage': metrics['percentage'],
            'feedback': feedback,
        }
        
        logger.info(f"Evaluation complete - Score: {metrics['score']}, Similarity: {metrics['percentage']}%")
        
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"Error in /api/evaluate: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': 'Failed to process evaluation',
            'details': str(e)
        }), 500


@app.route('/api/batch-evaluate', methods=['POST'])
def batch_evaluate():
    """
    Batch evaluate multiple answers
    
    Request JSON:
    {
        "evaluations": [
            {
                "question": "question text",
                "modelAnswer": "reference",
                "studentAnswer": "student answer"
            },
            ...
        ]
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'evaluations' not in data:
            return jsonify({'error': 'Missing evaluations array'}), 400
        
        evaluations = data['evaluations']
        if not isinstance(evaluations, list):
            return jsonify({'error': 'evaluations must be an array'}), 400
        
        results = []
        
        for eval_item in evaluations:
            try:
                model_answer = eval_item.get('modelAnswer', '').strip()
                student_answer = eval_item.get('studentAnswer', '').strip()
                question = eval_item.get('question', '').strip()
                
                if not model_answer or not student_answer:
                    results.append({
                        'success': False,
                        'error': 'Missing required fields'
                    })
                    continue
                
                similarity, metrics = compute_similarity(model_answer, student_answer)
                
                feedback = generate_feedback(
                    question=question,
                    model_answer=model_answer,
                    student_answer=student_answer,
                    similarity_score=similarity
                )
                
                results.append({
                    'success': True,
                    'score': metrics['score'],
                    'similarity': metrics['semantic_similarity'],
                    'similarity_percentage': metrics['percentage'],
                    'feedback': feedback,
                })
            except Exception as item_error:
                logger.error(f"Error evaluating item: {str(item_error)}")
                results.append({
                    'success': False,
                    'error': str(item_error)
                })
        
        return jsonify({
            'success': True,
            'total': len(evaluations),
            'results': results
        }), 200
        
    except Exception as e:
        logger.error(f"Error in /api/batch-evaluate: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': 'Failed to process batch evaluation',
            'details': str(e)
        }), 500


@app.route('/api/models', methods=['GET'])
def get_models_status():
    """Get status of loaded models"""
    return jsonify({
        'embeddings_ready': is_embeddings_ready(),
        'llm_ready': is_llm_ready(),
        'embeddings_model': 'sentence-transformers/all-MiniLM-L6-v2',
        'llm_model': 'google/flan-t5-base',
    }), 200


@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    logger.info("Starting Answer Evaluator Flask Backend")
    logger.info(f"Embeddings model ready: {is_embeddings_ready()}")
    logger.info(f"LLM model ready: {is_llm_ready()}")
    
    # Run with debug=True for development, set to False for production
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    )
