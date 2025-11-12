/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Request type for answer evaluation
 */
export interface EvaluationRequest {
  question: string;
  modelAnswer: string;
  studentAnswer: string;
}

/**
 * Response type for answer evaluation
 */
export interface EvaluationResponse {
  score: number;
  feedback: string;
  similarity: number;
}
