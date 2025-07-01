import React, { useState } from "react";
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

  const handleSelect = (qIdx: number, optIdx: number) => {
    if (!submitted) {
      setSelected((prev) => prev.map((v, i) => (i === qIdx ? optIdx : v)));
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
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
    >
      {questions.map((q, qIdx) => (
        <Card key={qIdx} className="p-4">
          <div className="font-medium mb-2">{q.question}</div>
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
                      type="radio"
                      name={`q${qIdx}`}
                      value={optIdx}
                      checked={isSelected}
                      onChange={() => handleSelect(qIdx, optIdx)}
                      disabled={submitted}
                      className="accent-primary"
                    />
                    <span>{opt}</span>
                  </label>
                </li>
              );
            })}
          </ul>
          {submitted && (
            <div className="mt-2 text-sm">
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
        </Card>
      ))}
      {!submitted ? (
        <Button type="submit" className="mt-2">
          Submit Quiz
        </Button>
      ) : (
        <div className="text-center mt-4 text-lg font-semibold">
          You got {correctCount} out of {questions.length} correct!
        </div>
      )}
    </form>
  );
};