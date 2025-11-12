import { GraduationCap } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-2">
          <GraduationCap size={32} />
          <h1 className="text-3xl font-bold">Answer Evaluator</h1>
        </div>
        <p className="text-blue-100 max-w-2xl">
          Automatically evaluate student answers using semantic similarity. Get
          instant scoring and constructive feedback powered by AI.
        </p>
      </div>
    </header>
  );
}
