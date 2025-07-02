import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

type Question = {
  question: string;
  options: string[];
  answer: number;
};

type QuizProps = {
  questions: Question[];
  courseId?: string; // Add courseId to associate with quiz_scores
};

export const Quiz: React.FC<QuizProps> = ({ questions, courseId }) => {
  const [selected, setSelected] = useState<(number | null)[]>(questions.map(() => null));
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const { user } = useUser();

  useEffect(() => {
    if (!submitted && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [submitted, questions]);

  const handleSelect = (qIdx: number, optIdx: number) => {
    if (!submitted) {
      setSelected((prev) => prev.map((v, i) => (i === qIdx ? optIdx : v)));
    }
  };

  const correctCount = selected.filter(
    (sel, idx) => sel === questions[idx].answer
  ).length;

  const handleSubmit = async () => {
    setSubmitted(true);

    // Save quiz attempt to Supabase if user and courseId are present
    if (user && courseId && !saved) {
      setSaving(true);
      const { error } = await supabase.from("quiz_scores").insert([
        {
          user_id: user.id,
          course_id: courseId,
          score: correctCount,
          total: questions.length,
          // taken_at will default to now()
        },
      ]);
      setSaving(false);
      if (!error) {
        setSaved(true);
        toast.success("Quiz attempt saved!");
      } else {
        toast.error("Failed to save quiz attempt.");
      }
    }
  };

  const handleRetake = () => {
    setSelected(questions.map(() => null));
    setSubmitted(false);
    setSaved(false);
  };

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        handleSubmit();
      }}
      className="space-y-6"
      aria-label="Quiz"
    >
      {questions.map((q, qIdx) => (
        <Card key={qIdx} className="p-4">
          <fieldset>
            <legend className="font-medium mb-2">{q.question}</legend>
            <ul>
              {q.options.map((opt, optIdx) => {
                const isSelected = selected[qIdx] === optIdx;
                const isCorrect = submitted && optIdx === q.answer;
                const isWrong =
                  submitted && isSelected && optIdx !== q.answer;
                return (
                  <li key={optIdx}>
                    <label
                      className={`flex items-center space-x-2 cursor-pointer ${
                        isCorrect
                          ? "text-green-600 font-semibold"
                          : isWrong
                          ? "text-red-600"
                          : ""
                      }`}
                    >
                      <input
                        ref={qIdx === 0 && optIdx === 0 ? firstInputRef : undefined}
                        type="radio"
                        name={`q${qIdx}`}
                        value={optIdx}
                        checked={isSelected}
                        onChange={() => handleSelect(qIdx, optIdx)}
                        disabled={submitted}
                        className="accent-primary"
                        aria-checked={isSelected}
                        aria-label={opt}
                      />
                      <span>{opt}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
            {submitted && (
              <div className="mt-2 text-sm" aria-live="polite">
                {selected[qIdx] === q.answer ? (
                  <span className="text-green-600">Correct!</span>
                ) : (
                  <span className="text-red-600">
                    Incorrect. Correct answer:{" "}
                    <span className="font-semibold">{q.options[q.answer]}</span>
                  </span>
                )}
              </div>
            )}
          </fieldset>
        </Card>
      ))}
      {!submitted ? (
        <Button type="submit" className="mt-2" disabled={saving}>
          Submit Quiz
        </Button>
      ) : (
        <div className="flex flex-col items-center gap-3 mt-4">
          <div className="text-lg font-semibold" aria-live="polite">
            You got {correctCount} out of {questions.length} correct!
          </div>
          {user && courseId && (
            <div className="text-sm text-gray-600">
              {saving
                ? "Saving your attempt..."
                : saved
                ? "Your attempt has been saved."
                : ""}
            </div>
          )}
          <Button type="button" variant="outline" onClick={handleRetake}>
            Retake Quiz
          </Button>
        </div>
      )}
    </form>
  );
};