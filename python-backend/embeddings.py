"""
Semantic similarity computation using sentence-transformers
"""

from sentence_transformers import SentenceTransformer, util
import numpy as np
from typing import Tuple

# Use all-MiniLM-L6-v2 - fast and accurate model
MODEL_NAME = 'sentence-transformers/all-MiniLM-L6-v2'

try:
    model = SentenceTransformer(MODEL_NAME)
    MODEL_LOADED = True
except Exception as e:
    print(f"Error loading model: {e}")
    MODEL_LOADED = False
    model = None


def get_embeddings(texts: list) -> np.ndarray:
    """
    Generate embeddings for a list of texts
    
    Args:
        texts: List of text strings
        
    Returns:
        Numpy array of embeddings
    """
    if not MODEL_LOADED or model is None:
        raise RuntimeError("Model not loaded. Check PyTorch and transformers installation.")
    
    embeddings = model.encode(texts, convert_to_tensor=False)
    return embeddings


def compute_similarity(text1: str, text2: str) -> Tuple[float, dict]:
    """
    Compute cosine similarity between two texts
    
    Args:
        text1: First text (model answer)
        text2: Second text (student answer)
        
    Returns:
        Tuple of (similarity_score, detailed_metrics)
    """
    if not MODEL_LOADED or model is None:
        raise RuntimeError("Model not loaded")
    
    # Encode both texts
    embeddings = model.encode([text1, text2], convert_to_tensor=True)
    
    # Compute cosine similarity
    similarity = util.cos_sim(embeddings[0], embeddings[1]).item()
    
    # Clamp between 0 and 1
    similarity = max(0, min(1, similarity))
    
    # Generate metrics
    metrics = {
        'semantic_similarity': round(similarity, 4),
        'score': round(similarity * 5, 2),  # Convert to 0-5 scale
        'percentage': round(similarity * 100, 1),
    }
    
    return similarity, metrics


def is_model_ready() -> bool:
    """Check if the embedding model is ready"""
    return MODEL_LOADED and model is not None
