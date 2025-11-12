"""
LLM-based feedback generation using HuggingFace transformers
"""

from transformers import pipeline
import torch
from typing import Optional

# Use a text generation model optimized for feedback
MODEL_NAME = "google/flan-t5-base"  # Free, good quality, ~900MB
# Alternative lighter models:
# - "google/flan-t5-small" (~300MB, faster)
# - "distilgpt2" (smaller but lower quality)

try:
    # Check if GPU is available
    device = 0 if torch.cuda.is_available() else -1
    
    # Initialize the text generation pipeline
    feedback_generator = pipeline(
        "text2text-generation",
        model=MODEL_NAME,
        device=device,
        truncation=True,
        max_length=256
    )
    MODEL_LOADED = True
except Exception as e:
    print(f"Error loading LLM model: {e}")
    MODEL_LOADED = False
    feedback_generator = None


def generate_feedback(
    question: str,
    model_answer: str,
    student_answer: str,
    similarity_score: float,
) -> str:
    """
    Generate constructive feedback using LLM
    
    Args:
        question: The original question
        model_answer: The model/reference answer
        student_answer: The student's answer
        similarity_score: Semantic similarity (0-1)
        
    Returns:
        Feedback string
    """
    if not MODEL_LOADED or feedback_generator is None:
        return get_fallback_feedback(similarity_score)
    
    try:
        # Create a prompt for the LLM
        prompt = f"""Evaluate a student's answer and provide brief constructive feedback.

Question: {question if question else "Assessment"}
Model Answer: {model_answer}
Student Answer: {student_answer}

Provide feedback that:
1. Acknowledges what the student got right
2. Points out what's missing or incorrect
3. Suggests how to improve

Keep feedback concise (2-3 sentences max)."""

        # Generate feedback
        result = feedback_generator(
            prompt,
            max_length=200,
            min_length=50,
            num_beams=4,
            early_stopping=True,
            temperature=0.7,
            do_sample=True
        )
        
        feedback = result[0]['generated_text'].strip()
        
        # Ensure feedback is reasonable length
        if len(feedback) > 500:
            feedback = feedback[:500] + "..."
        
        return feedback
        
    except Exception as e:
        print(f"Error generating feedback: {e}")
        return get_fallback_feedback(similarity_score)


def get_fallback_feedback(similarity_score: float) -> str:
    """
    Fallback feedback generation based on similarity score
    Used when LLM is not available or fails
    """
    score = round(similarity_score * 100)
    
    feedback_map = {
        (90, 100): "Excellent answer! Your response demonstrates comprehensive understanding of the key concepts. Well-structured and complete.",
        (80, 89): "Very good answer with strong understanding of the main points. Consider adding more specific examples or technical details for improvement.",
        (70, 79): "Good answer covering most key concepts. You could enhance it by including more specific details or examples mentioned in the reference answer.",
        (60, 69): "Your answer captures the basic idea but lacks some important details. Review the key concepts and try to include more specific information.",
        (50, 59): "Your answer shows partial understanding but is missing significant details. Consider reviewing the reference answer and incorporating more key concepts.",
        (40, 49): "Your answer addresses some concepts but needs substantial improvement. Focus on understanding the core concepts better.",
        (0, 39): "Your answer needs significant revision. Please review the key concepts thoroughly and practice similar questions.",
    }
    
    for (lower, upper), feedback in feedback_map.items():
        if lower <= score <= upper:
            return feedback
    
    return "Please review your answer and try again."


def is_model_ready() -> bool:
    """Check if the LLM model is ready"""
    return MODEL_LOADED and feedback_generator is not None
