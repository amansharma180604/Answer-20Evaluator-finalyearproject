/**
 * Utility functions for semantic similarity and embeddings
 * Uses HuggingFace Inference API (free tier)
 */

const HF_API_URL =
  "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2";
const HF_API_KEY = process.env.HF_API_KEY;

/**
 * Simple tokenization and normalization
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 0);
}

/**
 * Common English stop words
 */
const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "been",
  "before",
  "being",
  "but",
  "by",
  "for",
  "from",
  "had",
  "has",
  "have",
  "he",
  "her",
  "here",
  "hers",
  "him",
  "his",
  "how",
  "i",
  "if",
  "in",
  "into",
  "is",
  "it",
  "its",
  "just",
  "me",
  "my",
  "of",
  "on",
  "or",
  "other",
  "our",
  "ours",
  "out",
  "over",
  "own",
  "s",
  "she",
  "so",
  "some",
  "such",
  "t",
  "than",
  "that",
  "the",
  "their",
  "theirs",
  "them",
  "then",
  "there",
  "these",
  "they",
  "this",
  "to",
  "too",
  "under",
  "until",
  "up",
  "very",
  "was",
  "we",
  "were",
  "what",
  "when",
  "where",
  "which",
  "while",
  "who",
  "whom",
  "why",
  "with",
  "you",
  "your",
  "yours",
]);

/**
 * Simple embedding using word features (fallback for no API key)
 * Creates a vector representation based on word frequencies
 */
function getFallbackEmbedding(text: string): number[] {
  const tokens = tokenize(text);
  const contentTokens = tokens.filter(
    (t) => !STOP_WORDS.has(t) && t.length > 2,
  );

  // Create a feature vector
  const embedding: number[] = [];

  // Add basic text length features
  embedding.push(Math.min(tokens.length / 100, 1)); // Normalized token count
  embedding.push(Math.min(contentTokens.length / 50, 1)); // Normalized content token count
  embedding.push(tokens.length > 0 ? contentTokens.length / tokens.length : 0); // Content ratio

  // Create word-based features using simple hashing
  // Use first 256 dimensions for word presence
  const wordFeatures = new Array(256).fill(0);

  for (const token of contentTokens) {
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      hash = (hash << 5) - hash + token.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    const index = Math.abs(hash) % 256;
    wordFeatures[index] += 1 / Math.max(contentTokens.length, 1);
  }

  // Normalize word features
  const maxFeature = Math.max(...wordFeatures, 1);
  const normalizedWordFeatures = wordFeatures.map((f) =>
    Math.min(f / maxFeature, 1),
  );

  return [...embedding, ...normalizedWordFeatures];
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
        `HuggingFace API error: ${response.statusText}, using fallback`,
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
      (word) => word.length > 3 && !stopWords.has(word.replace(/[^a-z]/g, "")),
    );
}

/**
 * Calculate feedback based on similarity and keyword matching
 */
function generateFeedback(
  similarity: number,
  modelKeywords: string[],
  studentKeywords: string[],
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
