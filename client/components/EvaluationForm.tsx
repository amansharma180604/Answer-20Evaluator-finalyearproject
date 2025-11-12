import { useState, useEffect } from "react";
import { EvaluationRequest, EvaluationResponse } from "@shared/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Zap,
  Server,
} from "lucide-react";

interface BackendStatus {
  pythonBackend: "connected" | "unavailable";
  expressBackend: "ready" | "error";
  models?: {
    embeddings_ready: boolean;
    llm_ready: boolean;
  };
}

export default function EvaluationForm() {
  const [question, setQuestion] = useState("");
  const [modelAnswer, setModelAnswer] = useState("");
  const [studentAnswer, setStudentAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvaluationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(null);

  // Check backend status on component mount
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const response = await fetch("/api/backend-status");
        if (response.ok) {
          const data = (await response.json()) as BackendStatus;
          setBackendStatus(data);
        }
      } catch (err) {
        console.error("Failed to check backend status:", err);
      }
    };

    checkBackendStatus();
    // Re-check every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!modelAnswer.trim() || !studentAnswer.trim()) {
      setError("Please fill in both model answer and student answer");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          modelAnswer,
          studentAnswer,
        } as EvaluationRequest),
      });

      if (!response.ok) {
        throw new Error("Failed to evaluate answer");
      }

      const data = (await response.json()) as EvaluationResponse;
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during evaluation"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setQuestion("");
    setModelAnswer("");
    setStudentAnswer("");
    setResult(null);
    setError(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return "text-green-600";
    if (score >= 3.5) return "text-blue-600";
    if (score >= 2.5) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 4.5) return "bg-green-50";
    if (score >= 3.5) return "bg-blue-50";
    if (score >= 2.5) return "bg-amber-50";
    return "bg-red-50";
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Backend Status Indicator */}
      {backendStatus && (
        <div className="mb-6 p-4 rounded-lg border bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3 text-sm">
            <Server size={18} className="text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-blue-900">
                {backendStatus.pythonBackend === "connected" ? (
                  <>
                    <Zap className="inline mr-2" size={14} />
                    Enhanced AI Mode
                  </>
                ) : (
                  <>JavaScript Fallback Mode</>
                )}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                {backendStatus.pythonBackend === "connected"
                  ? "Using Python ML models for superior semantic analysis"
                  : "Using JavaScript implementation for evaluation"}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question Field */}
        <div className="space-y-2">
          <Label htmlFor="question" className="text-base font-semibold">
            Question (Optional)
          </Label>
          <Textarea
            id="question"
            placeholder="Enter the question being evaluated (optional for context)"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="resize-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
        </div>

        {/* Model Answer Field */}
        <div className="space-y-2">
          <Label htmlFor="modelAnswer" className="text-base font-semibold">
            Model Answer (Reference)
          </Label>
          <Textarea
            id="modelAnswer"
            placeholder="Paste the ideal/model answer here"
            value={modelAnswer}
            onChange={(e) => setModelAnswer(e.target.value)}
            className="resize-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
          <p className="text-sm text-gray-500">
            {modelAnswer.length} characters
          </p>
        </div>

        {/* Student Answer Field */}
        <div className="space-y-2">
          <Label htmlFor="studentAnswer" className="text-base font-semibold">
            Student Answer
          </Label>
          <Textarea
            id="studentAnswer"
            placeholder="Paste the student's answer here"
            value={studentAnswer}
            onChange={(e) => setStudentAnswer(e.target.value)}
            className="resize-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
          <p className="text-sm text-gray-500">
            {studentAnswer.length} characters
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertTriangle className="text-red-600 flex-shrink-0" size={20} />
            <div>
              <p className="font-semibold text-red-900">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                Evaluating...
              </>
            ) : (
              <>
                <CheckCircle2 size={18} className="mr-2" />
                Evaluate Answer
              </>
            )}
          </Button>
          <Button
            type="button"
            onClick={handleReset}
            variant="outline"
            className="px-6 font-semibold"
          >
            Reset
          </Button>
        </div>
      </form>

      {/* Results Section */}
      {result && (
        <div className="mt-8 space-y-6">
          <div className="border-t-2 border-gray-200 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Evaluation Results
            </h2>

            {/* Score Card */}
            <div
              className={`rounded-lg border-2 p-6 mb-6 ${getScoreBgColor(result.score)} border-gray-200`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 font-medium mb-2">Score</p>
                  <div className={`text-5xl font-bold ${getScoreColor(result.score)}`}>
                    {result.score}
                    <span className="text-2xl text-gray-500 font-normal ml-1">
                      / 5
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-600 font-medium mb-2">Similarity</p>
                  <p className="text-3xl font-bold text-gray-700">
                    {Math.round(result.similarity * 100)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Feedback Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start gap-3 mb-3">
                <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                <p className="font-semibold text-gray-900">Feedback</p>
              </div>
              <p className="text-gray-700 leading-relaxed">{result.feedback}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
