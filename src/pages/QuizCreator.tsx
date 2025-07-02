import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Option = { text: string };
type Question = {
  text: string;
  options: Option[];
  correct: number | null;
};

const getYoutubeId = (url: string) => {
  // Extracts the video ID from a YouTube URL
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^?&]+)/,
  );
  return match ? match[1] : "";
};

const QuizCreator: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizTitle, setQuizTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { text: "", options: [{ text: "" }, { text: "" }], correct: null },
    ]);
  };

  const handleRemoveQuestion = (qIdx: number) => {
    setQuestions(questions.filter((_, i) => i !== qIdx));
  };

  const handleQuestionChange = (qIdx: number, value: string) => {
    setQuestions(
      questions.map((q, i) =>
        i === qIdx ? { ...q, text: value } : q,
      ),
    );
  };

  const handleOptionChange = (qIdx: number, oIdx: number, value: string) => {
    setQuestions(
      questions.map((q, i) =>
        i === qIdx
          ? {
              ...q,
              options: q.options.map((opt, j) =>
                j === oIdx ? { text: value } : opt,
              ),
            }
          : q,
      ),
    );
  };

  const handleAddOption = (qIdx: number) => {
    setQuestions(
      questions.map((q, i) =>
        i === qIdx
          ? { ...q, options: [...q.options, { text: "" }] }
          : q,
      ),
    );
  };

  const handleRemoveOption = (qIdx: number, oIdx: number) => {
    setQuestions(
      questions.map((q, i) =>
        i === qIdx
          ? {
              ...q,
              options: q.options.filter((_, j) => j !== oIdx),
              correct:
                q.correct === oIdx
                  ? null
                  : q.correct !== null && q.correct > oIdx
                  ? q.correct - 1
                  : q.correct,
            }
          : q,
      ),
    );
  };

  const handleSetCorrect = (qIdx: number, oIdx: number) => {
    setQuestions(
      questions.map((q, i) =>
        i === qIdx ? { ...q, correct: oIdx } : q,
      ),
    );
  };

  const handleSave = () => {
    setSaving(true);
    // For now, just log the quiz data and show a toast
    const quizData = {
      title: quizTitle,
      videoUrl,
      questions,
    };
    console.log("Quiz saved:", quizData);
    toast.success("Quiz saved! (Check console for data)");
    setSaving(false);
  };

  const videoId = getYoutubeId(videoUrl);

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Quiz Creator</h1>
      <Card className="p-6 mb-8">
        <div className="mb-4">
          <label className="block font-medium mb-1">Quiz Title</label>
          <Input
            value={quizTitle}
            onChange={e => setQuizTitle(e.target.value)}
            placeholder="Enter quiz title"
          />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">YouTube Video URL</label>
          <Input
            value={videoUrl}
            onChange={e => setVideoUrl(e.target.value)}
            placeholder="Paste YouTube video URL"
          />
        </div>
        {videoId && (
          <div className="mb-4">
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube Video Preview"
                allowFullScreen
                className="w-full h-64 rounded border"
              />
            </div>
          </div>
        )}
        <div>
          <h2 className="text-xl font-semibold mb-2">Questions</h2>
          {questions.length === 0 && (
            <div className="text-gray-500 mb-4">No questions yet.</div>
          )}
          <div className="space-y-6">
            {questions.map((q, qIdx) => (
              <Card key={qIdx} className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="font-medium">
                    Question {qIdx + 1}
                  </label>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveQuestion(qIdx)}
                  >
                    Remove
                  </Button>
                </div>
                <Input
                  value={q.text}
                  onChange={e => handleQuestionChange(qIdx, e.target.value)}
                  placeholder="Enter question text"
                  className="mb-3"
                />
                <div>
                  <label className="font-medium mb-1 block">Options</label>
                  <div className="space-y-2">
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${qIdx}`}
                          checked={q.correct === oIdx}
                          onChange={() => handleSetCorrect(qIdx, oIdx)}
                          className="accent-primary"
                          aria-label="Set as correct answer"
                        />
                        <Input
                          value={opt.text}
                          onChange={e =>
                            handleOptionChange(qIdx, oIdx, e.target.value)
                          }
                          placeholder={`Option ${oIdx + 1}`}
                        />
                        {q.options.length > 2 && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleRemoveOption(qIdx, oIdx)}
                            type="button"
                          >
                            ×
                          </Button>
                        )}
                        {q.correct === oIdx && (
                          <span className="text-green-600 text-xs ml-1">
                            Correct
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-2"
                    onClick={() => handleAddOption(qIdx)}
                    type="button"
                  >
                    Add Option
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          <Button
            className="mt-4"
            onClick={handleAddQuestion}
            type="button"
          >
            Add Question
          </Button>
        </div>
        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving || !quizTitle || !videoId || questions.length === 0}
          >
            {saving ? "Saving..." : "Save Quiz"}
          </Button>
        </div>
      </Card>
      {/* Live Preview */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
        <div>
          <div className="font-bold mb-2">{quizTitle || "Quiz Title"}</div>
          {videoId && (
            <div className="mb-4">
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="YouTube Video Preview"
                  allowFullScreen
                  className="w-full h-64 rounded border"
                />
              </div>
            </div>
          )}
          <ol className="list-decimal pl-5 space-y-4">
            {questions.map((q, qIdx) => (
              <li key={qIdx}>
                <div className="font-medium">{q.text || <span className="text-gray-400">[No question text]</span>}</div>
                <ul className="list-disc pl-5">
                  {q.options.map((opt, oIdx) => (
                    <li key={oIdx} className={q.correct === oIdx ? "text-green-600 font-semibold" : ""}>
                      {opt.text || <span className="text-gray-400">[No option text]</span>}
                      {q.correct === oIdx && <span className="ml-2 text-xs">(Correct)</span>}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </Card>
    </div>
  );
};

export default QuizCreator;