"use client";
import { useEffect, useState } from "react";

interface Question {
  id: string;
  name: string;
  email?: string;
  question: string;
  createdAt: string;
}

export default function FAQPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchQuestions() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/questions");
        if (!res.ok) throw new Error("Failed to fetch questions");
        const data = await res.json();
        setQuestions(data);
      } catch (err) {
        setError("Could not load questions. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, []);

  return (
    <div className="min-h-screen bg-cream px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-burgundy font-display mb-8">Frequently Asked Questions</h1>
        {loading && <div className="text-burgundy text-lg mb-8">Loading...</div>}
        {error && <div className="text-red-700 mb-8">{error}</div>}
        {questions.length === 0 && !loading && !error && (
          <div className="text-burgundy/70 mb-8">No questions have been submitted yet.</div>
        )}
        <ul className="space-y-8">
          {questions.map(q => (
            <li key={q.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-burgundy">{q.name}</span>
                <span className="text-sm text-gray-500">{new Date(q.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="text-lg text-gray-800">{q.question}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 