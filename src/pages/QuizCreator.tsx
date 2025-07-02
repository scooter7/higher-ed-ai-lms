import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/lib/supabaseClient";

type Option = { text: string };
type Question = {
  text: string;
  options: Option[];
  correct: number | null;
};

type Quiz = {
  id: string;
  title: string;
  video_url: string;
  categories: string[];
  questions: Question[];
  created_at: string;
};

type Media = {
  id: string;
  course_id: string;
  type: "video" | "reading" | "podcast";
  title: string;
  url: string;
  created_at: string;
};

const ADMIN_EMAIL = "james@shmooze.io";

const CATEGORY_OPTIONS = [
  { value: "digital-marketing", label: "Digital Marketing" },
  { value: "brand-strategy", label: "Brand Strategy" },
  { value: "market-research", label: "Market Research" },
  { value: "web-development", label: "Web Development" },
  { value: "social-media", label: "Social Media" },
  { value: "graphic-design", label: "Graphic Design" },
  { value: "copywriting", label: "Copywriting" },
  { value: "email-marketing", label: "Email Marketing" },
  { value: "text-message-marketing", label: "Text Message Marketing" },
];

const getYoutubeId = (url: string) => {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^?&]+)/,
  );
  return match ? match[1] : "";
};

const QuizCreator: React.FC = () => {
  const { user } = useUser();
  const [videoUrl, setVideoUrl] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizTitle, setQuizTitle] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Quiz list state
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);

  // Media state
  const [media, setMedia] = useState<Media[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaCourse, setMediaCourse] = useState<string>(CATEGORY_OPTIONS[0].value);
  const [mediaType, setMediaType] = useState<"video" | "reading" | "podcast">("reading");
  const [mediaTitle, setMediaTitle] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");

  // Fetch quizzes created by admin
  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoadingQuizzes(true);
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        setQuizzes(data);
      }
      setLoadingQuizzes(false);
    };
    fetchQuizzes();
  }, [saving]);

  // Fetch all media
  useEffect(() => {
    const fetchMedia = async () => {
      setMediaLoading(true);
      const { data, error } = await supabase
        .from("course_media")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        setMedia(data);
      }
      setMediaLoading(false);
    };
    fetchMedia();
  }, [saving, mediaLoading]);

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8">
          <div className="text-xl font-semibold text-center">
            Access Denied
          </div>
          <div className="text-gray-500 mt-2 text-center">
            You do not have permission to view this page.
          </div>
        </Card>
      </div>
    );
  }

  // Form handlers (quiz)
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

  const resetForm = () => {
    setQuizTitle("");
    setVideoUrl("");
    setCategories([]);
    setQuestions([]);
    setEditingId(null);
  };

  const handleSave = async () => {
    setSaving(true);
    const quizData = {
      title: quizTitle,
      video_url: videoUrl,
      categories,
      questions,
      created_by: user.id,
    };
    if (editingId) {
      // Update existing quiz
      const { error } = await supabase
        .from("quizzes")
        .update(quizData)
        .eq("id", editingId);
      if (!error) {
        toast.success("Quiz updated!");
        resetForm();
      } else {
        toast.error("Failed to update quiz.");
      }
    } else {
      // Insert new quiz
      const { error } = await supabase.from("quizzes").insert([quizData]);
      if (!error) {
        toast.success("Quiz saved!");
        resetForm();
      } else {
        toast.error("Failed to save quiz.");
      }
    }
    setSaving(false);
  };

  const handleEdit = (quiz: Quiz) => {
    setQuizTitle(quiz.title);
    setVideoUrl(quiz.video_url);
    setCategories(quiz.categories);
    setQuestions(quiz.questions);
    setEditingId(quiz.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;
    const { error } = await supabase.from("quizzes").delete().eq("id", id);
    if (!error) {
      toast.success("Quiz deleted.");
      setQuizzes((prev) => prev.filter((q) => q.id !== id));
      if (editingId === id) resetForm();
    } else {
      toast.error("Failed to delete quiz.");
    }
  };

  // Media handlers
  const handleAddMedia = async () => {
    if (!mediaCourse || !mediaType || !mediaTitle || !mediaUrl) {
      toast.error("Please fill in all media fields.");
      return;
    }
    setMediaLoading(true);
    const { error } = await supabase.from("course_media").insert([
      {
        course_id: mediaCourse,
        type: mediaType,
        title: mediaTitle,
        url: mediaUrl,
      },
    ]);
    if (!error) {
      toast.success("Media added!");
      setMediaTitle("");
      setMediaUrl("");
      setMediaLoading(false);
      // Refetch media
      setMediaLoading(true);
    } else {
      toast.error("Failed to add media.");
      setMediaLoading(false);
    }
  };

  const handleDeleteMedia = async (id: string) => {
    if (!window.confirm("Delete this media item?")) return;
    setMediaLoading(true);
    const { error } = await supabase.from("course_media").delete().eq("id", id);
    if (!error) {
      toast.success("Media deleted.");
      setMediaLoading(false);
      // Refetch media
      setMediaLoading(true);
    } else {
      toast.error("Failed to delete media.");
      setMediaLoading(false);
    }
  };

  const videoId = getYoutubeId(videoUrl);

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">
        {editingId ? "Edit Quiz" : "Quiz Creator"}
      </h1>
      {/* --- Media Management Section --- */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Add Course Media (Readings, Podcasts, Videos)</h2>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <label className="block font-medium mb-1">Course</label>
            <select
              className="w-full border rounded px-2 py-1"
              value={mediaCourse}
              onChange={e => setMediaCourse(e.target.value)}
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block font-medium mb-1">Type</label>
            <select
              className="w-full border rounded px-2 py-1"
              value={mediaType}
              onChange={e => setMediaType(e.target.value as any)}
            >
              <option value="reading">Reading (Document or Webpage)</option>
              <option value="podcast">Podcast (Audio or Podcast URL)</option>
              <option value="video">Video (YouTube or Video URL)</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <label className="block font-medium mb-1">Title</label>
            <Input
              value={mediaTitle}
              onChange={e => setMediaTitle(e.target.value)}
              placeholder="Enter media title"
            />
          </div>
          <div className="flex-1">
            <label className="block font-medium mb-1">URL</label>
            <Input
              value={mediaUrl}
              onChange={e => setMediaUrl(e.target.value)}
              placeholder="Paste media URL (webpage, document, audio, or video)"
            />
          </div>
        </div>
        <Button onClick={handleAddMedia} disabled={mediaLoading}>
          {mediaLoading ? "Adding..." : "Add Media"}
        </Button>
        <div className="mt-6">
          <h3 className="font-semibold mb-2">All Media</h3>
          {mediaLoading ? (
            <div className="text-gray-500">Loading...</div>
          ) : (
            <div className="space-y-2">
              {media.length === 0 && (
                <div className="text-gray-500">No media found.</div>
              )}
              {media.map((m) => (
                <Card key={m.id} className="p-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{m.title}</div>
                    <div className="text-xs text-gray-500">
                      {CATEGORY_OPTIONS.find((c) => c.value === m.course_id)?.label || m.course_id} &middot; {m.type}
                    </div>
                    <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">
                      {m.url}
                    </a>
                  </div>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteMedia(m.id)}>
                    Delete
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Card>
      {/* --- Quiz Management Section (existing) --- */}
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
        <div className="mb-4">
          <label className="block font-medium mb-1">Categories</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((cat) => (
              <label
                key={cat.value}
                className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer border ${
                  categories.includes(cat.value)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-gray-100 border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={categories.includes(cat.value)}
                  onChange={() => {
                    setCategories((prev) =>
                      prev.includes(cat.value)
                        ? prev.filter((c) => c !== cat.value)
                        : [...prev, cat.value],
                    );
                  }}
                  className="accent-primary"
                />
                {cat.label}
              </label>
            ))}
          </div>
        </div>
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
        <div className="mt-8 flex gap-2 justify-end">
          {editingId && (
            <Button
              variant="outline"
              onClick={resetForm}
              disabled={saving}
              type="button"
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={
              saving ||
              !quizTitle ||
              !videoId ||
              questions.length === 0 ||
              categories.length === 0
            }
          >
            {saving
              ? editingId
                ? "Saving..."
                : "Saving..."
              : editingId
              ? "Update Quiz"
              : "Save Quiz"}
          </Button>
        </div>
      </Card>
      {/* Live Preview */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
        <div>
          <div className="font-bold mb-2">{quizTitle || "Quiz Title"}</div>
          {categories.length > 0 && (
            <div className="mb-2 text-sm text-gray-600">
              Categories:{" "}
              {categories
                .map(
                  (cat) =>
                    CATEGORY_OPTIONS.find((c) => c.value === cat)?.label ||
                    cat,
                )
                .join(", ")}
            </div>
          )}
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
                <div className="font-medium">
                  {q.text || (
                    <span className="text-gray-400">[No question text]</span>
                  )}
                </div>
                <ul className="list-disc pl-5">
                  {q.options.map((opt, oIdx) => (
                    <li
                      key={oIdx}
                      className={
                        q.correct === oIdx ? "text-green-600 font-semibold" : ""
                      }
                    >
                      {opt.text || (
                        <span className="text-gray-400">[No option text]</span>
                      )}
                      {q.correct === oIdx && (
                        <span className="ml-2 text-xs">(Correct)</span>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </Card>
      {/* Quiz List */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">All Quizzes</h2>
        {loadingQuizzes ? (
          <div className="text-gray-500">Loading...</div>
        ) : quizzes.length === 0 ? (
          <div className="text-gray-500">No quizzes found.</div>
        ) : (
          <div className="space-y-4">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <div className="font-semibold">{quiz.title}</div>
                  <div className="text-sm text-gray-600">
                    Categories:{" "}
                    {quiz.categories
                      .map(
                        (cat) =>
                          CATEGORY_OPTIONS.find((c) => c.value === cat)?.label ||
                          cat,
                      )
                      .join(", ")}
                  </div>
                  <div className="text-xs text-gray-400">
                    Created: {new Date(quiz.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2 mt-2 md:mt-0">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleEdit(quiz)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(quiz.id)}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default QuizCreator;