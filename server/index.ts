import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleEvaluate } from "./routes/evaluate";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Backend status endpoint
  app.get("/api/backend-status", async (_req, res) => {
    try {
      const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || "http://localhost:5000";

      try {
        const healthResponse = await fetch(`${pythonBackendUrl}/health`, {
          method: "GET",
          signal: AbortSignal.timeout(5000), // 5 second timeout
        });

        if (healthResponse.ok) {
          const healthData = await healthResponse.json();
          return res.json({
            status: "ok",
            expressBackend: "ready",
            pythonBackend: "connected",
            models: healthData,
          });
        }
      } catch {
        // Python backend not available
      }

      res.json({
        status: "ok",
        expressBackend: "ready",
        pythonBackend: "unavailable",
        fallback: "using JavaScript implementation",
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Failed to check backend status",
      });
    }
  });

  // Evaluation API
  app.post("/api/evaluate", handleEvaluate);

  return app;
}
