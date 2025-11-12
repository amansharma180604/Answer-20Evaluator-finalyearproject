import { RequestHandler } from "express";
import { EvaluationRequest, EvaluationResponse } from "@shared/api";
import {
  getEmbedding,
  cosineSimilarity,
  generateFeedback,
} from "../utils/embeddings";

export const handleEvaluate: RequestHandler = async (req, res) => {
  try {
    const { question, modelAnswer, studentAnswer } =
      req.body as EvaluationRequest;

    // Validate inputs
    if (!modelAnswer || !studentAnswer) {
      return res.status(400).json({
        error: "Missing required fields: modelAnswer and studentAnswer",
      });
    }

    // Get embeddings for both answers
    const [modelEmbedding, studentEmbedding] = await Promise.all([
      getEmbedding(modelAnswer),
      getEmbedding(studentAnswer),
    ]);

    // Calculate semantic similarity
    const similarity = cosineSimilarity(modelEmbedding, studentEmbedding);

    // Convert similarity to score (0-5 scale)
    const score = Math.round(similarity * 5 * 10) / 10;

    // Generate feedback based on similarity
    const feedback = generateFeedback(similarity, [], []);

    const response: EvaluationResponse = {
      score: Math.max(0, Math.min(5, score)), // Clamp between 0-5
      feedback,
      similarity: Math.round(similarity * 1000) / 1000,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Evaluation error:", error);
    res.status(500).json({
      error: "Failed to evaluate answer. Please try again.",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};
