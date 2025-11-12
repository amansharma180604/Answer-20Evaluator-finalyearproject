import Header from "@/components/Header";
import EvaluationForm from "@/components/EvaluationForm";

export default function Index() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-12">
        <div className="px-4">
          <EvaluationForm />
        </div>
      </main>
    </div>
  );
}
