/**
 * Utility functions for semantic similarity and embeddings
 * Uses HuggingFace Inference API (free tier)
 */

const HF_API_URL = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2";
const HF_API_KEY = process.env.HF_API_KEY;

/**
 * Simple fallback embedding using text features
 * This provides a basic semantic similarity without API calls
 */
function getFallbackEmbedding(text: string): number[] {
  // Normalize text
  const normalized = text.toLowerCase().trim();

  // Extract features from the text
  const features = {
    length: normalized.length / 100, // Normalize length
    wordCount: normalized.split(/\s+/).length / 10,
    sentenceCount: (normalized.match(/[.!?]/g) || []).length,
    questionCount: (normalized.match(/\?/g) || []).length,
    uniqueWords: new Set(normalized.split(/\s+/)).size / 10,
  };

  // Create a simple embedding vector based on text characteristics
  // This is a very basic approach for demonstration/fallback
  const words = normalized.split(/\s+/);
  const commonWords = new Set([
    "the",
    "is",
    "at",
    "which",
    "on",
    "and",
    "a",
    "an",
    "as",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
  ]);

  const contentWords = words.filter(
    (w) =>
      w.length > 2 &&
      !commonWords.has(w.replace(/[^a-z]/g, "")) &&
      /[a-z]/.test(w)
  );

  // Create a simple embedding from word features
  const embedding: number[] = [];

  // Add basic text statistics
  embedding.push(features.length);
  embedding.push(features.wordCount);
  embedding.push(features.sentenceCount);
  embedding.push(features.questionCount);
  embedding.push(features.uniqueWords);

  // Add hash-based features for content words
  for (let i = 0; i < 10; i++) {
    let hash = 0;
    for (let j = i * 5; j < (i + 1) * 5 && j < contentWords.length; j++) {
      const word = contentWords[j];
      for (let k = 0; k < word.length; k++) {
        hash += word.charCodeAt(k) * (k + 1);
      }
    }
    embedding.push((hash % 100) / 100);
  }

  return embedding;
}

/**
 * Compute embedding for text using HuggingFace Inference API
 * Falls back to simple text features if API is unavailable
 */
async function getEmbedding(text: string): Promise<number[]> {
  // If no API key, use fallback
  if (!HF_API_KEY) {
    console.log("Using fallback embedding (no HF_API_KEY provided)");
    return getFallbackEmbedding(text);
  }

  try {
    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${HF_API_KEY}`,
      },
      body: JSON.stringify({ inputs: text }),
    });

    if (!response.ok) {
      console.warn(
        `HuggingFace API error: ${response.statusText}, using fallback`
      );
      return getFallbackEmbedding(text);
    }

    const result = await response.json();
    if (Array.isArray(result) && result.length > 0) {
      return result[0];
    }
    return getFallbackEmbedding(text);
  } catch (error) {
    console.warn("Error getting embedding from API, using fallback:", error);
    return getFallbackEmbedding(text);
  }
}

/**
 * Compute cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length === 0 || b.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

/**
 * Extract keywords from text (simple keyword extraction)
 */
function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    "a",
    "an",
    "the",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "is",
    "are",
    "am",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "must",
    "can",
    "this",
    "that",
    "these",
    "those",
    "i",
    "you",
    "he",
    "she",
    "it",
    "we",
    "they",
  ]);

  return text
    .toLowerCase()
    .split(/\s+/)
    .filter(
      (word) => word.length > 3 && !stopWords.has(word.replace(/[^a-z]/g, ""))
    );
}

/**
 * Calculate feedback based on similarity and keyword matching
 */
function generateFeedback(
  similarity: number,
  modelKeywords: string[],
  studentKeywords: string[]
): string {
  const score = Math.round(similarity * 100);

  if (score >= 90) {
    return "Excellent answer! Your response demonstrates comprehensive understanding of the key concepts. Well-structured and complete.";
  }

  if (score >= 80) {
    return "Very good answer with strong understanding of the main points. Consider adding more specific examples or technical details for improvement.";
  }

  if (score >= 70) {
    return "Good answer covering most key concepts. You could enhance it by including more specific details or examples mentioned in the reference answer.";
  }

  if (score >= 60) {
    return "Your answer captures the basic idea but lacks some important details. Review the key concepts and try to include more specific information.";
  }

  if (score >= 50) {
    return "Your answer shows partial understanding but is missing significant details. Consider reviewing the reference answer and incorporating more key concepts.";
  }

  if (score >= 40) {
    return "Your answer addresses some concepts but needs substantial improvement. Focus on understanding the core concepts better before attempting answers.";
  }

  return "Your answer needs significant revision. Please review the key concepts thoroughly and practice similar questions.";
}

export { getEmbedding, cosineSimilarity, extractKeywords, generateFeedback };
