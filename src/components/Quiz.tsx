import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Question = {
  question: string;
  options: string[];
  answer: number;
};

type QuizProps = {
  questions: Question[];
};

export const Quiz: React.FC<QuizProps> = ({ questions }) => {
  const [selected, setSelected] = useState<(number | null)[]>(questions.map(() => null));
  const [submitted, setSubmitted] = useState(false);
  const firstInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleRetake = () => {
    setSelected(questions.map(() => null));
    setSubmitted(false);
  };

  const correctCount = selected.filter(
    (sel, idx) => sel === questions[idx].answer
  ).length;

  return (
    <form
      onSubmit={(e) => {
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
        <Button type="submit" className="mt-2">
          Submit Quiz
        </Button>
      ) : (
        <div className="flex flex-col items-center gap-3 mt-4">
          <div className="text-lg font-semibold" aria-live="polite">
            You got {correctCount} out of {questions.length} correct!
          </div>
          <Button type="button" variant="outline" onClick={handleRetake}>
            Retake Quiz
          </Button>
        </div>
      )}
    </form>
  );
};