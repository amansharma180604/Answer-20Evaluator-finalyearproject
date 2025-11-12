import { RequestHandler } from "express";
import { EvaluationRequest, EvaluationResponse } from "@shared/api";

/**
 * Call Python backend for evaluation
 * Falls back to JavaScript implementation if Python backend is unavailable
 */
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

    // Try to call Python backend first
    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || "http://localhost:5000";

    try {
      console.log(`Calling Python backend at ${pythonBackendUrl}/api/evaluate`);

      const pythonResponse = await fetch(`${pythonBackendUrl}/api/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          modelAnswer,
          studentAnswer,
        }),
      });

      if (pythonResponse.ok) {
        const pythonData = await pythonResponse.json();

        // Transform Python response to match EvaluationResponse interface
        const response: EvaluationResponse = {
          score: pythonData.score,
          feedback: pythonData.feedback,
          similarity: pythonData.similarity,
        };

        console.log(`Python evaluation successful - Score: ${response.score}`);
        return res.status(200).json(response);
      } else {
        console.warn(`Python backend returned ${pythonResponse.status}, falling back to JS`);
      }
    } catch (pythonError) {
      console.warn("Python backend unavailable, using fallback JavaScript implementation");
      console.error(pythonError);
    }

    // Fallback: Use JavaScript implementation
    console.log("Using JavaScript fallback for evaluation");
    const {
      getEmbedding,
      cosineSimilarity,
      generateFeedback,
    } = await import("../utils/embeddings");

    const [modelEmbedding, studentEmbedding] = await Promise.all([
      getEmbedding(modelAnswer),
      getEmbedding(studentAnswer),
    ]);

    const similarity = cosineSimilarity(modelEmbedding, studentEmbedding);
    const score = Math.round(similarity * 5 * 10) / 10;
    const feedback = generateFeedback(similarity, [], []);

    const response: EvaluationResponse = {
      score: Math.max(0, Math.min(5, score)),
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
