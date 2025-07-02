import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/lib/supabaseClient";

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

type Question = {
  question: string;
  options: string[];
  answer: number;
};

type Quiz = {
  id: string;
  title: string;
  video_url: string;
  categories: string[];
  questions: {
    text: string;
    options: { text: string }[];
    correct: number | null;
  }[];
  created_at?: string;
};

type Media = {
  id: string;
  course_id: string;
  type: "video" | "reading" | "podcast";
  title: string;
  url: string;
  created_at: string;
};

function getYoutubeId(url: string) {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^?&]+)/
  );
  return match ? match[1] : "";
}

const CourseCreator: React.FC = () => {
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

  useEffect(() => {
    fetchMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      await fetchMedia();
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
      await fetchMedia();
    } else {
      toast.error("Failed to delete media.");
      setMediaLoading(false);
    }
  };

  // Quiz handlers
  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", options: ["", "", "", ""], answer: 0 },
    ]);
  };

  const handleQuestionChange = (idx: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === idx ? { ...q, question: value } : q
      )
    );
  };

  const handleOptionChange = (qIdx: number, optIdx: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? {
              ...q,
              options: q.options.map((opt, oi) =>
                oi === optIdx ? value : opt
              ),
            }
          : q
      )
    );
  };

  const handleAnswerChange = (qIdx: number, ansIdx: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx ? { ...q, answer: ansIdx } : q
      )
    );
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveQuiz = async () => {
    if (!quizTitle || !videoUrl || categories.length === 0 || questions.length === 0) {
      toast.error("Please fill in all quiz fields.");
      return;
    }
    setSaving(true);
    const quizPayload = {
      title: quizTitle,
      video_url: videoUrl,
      categories,
      questions: questions.map((q) => ({
        text: q.question,
        options: q.options.map((opt) => ({ text: opt })),
        correct: q.answer,
      })),
      created_by: user.id,
    };
    let result;
    if (editingId) {
      result = await supabase
        .from("quizzes")
        .update(quizPayload)
        .eq("id", editingId);
    } else {
      result = await supabase.from("quizzes").insert([quizPayload]);
    }
    if (!result.error) {
      toast.success("Quiz saved!");
      setQuizTitle("");
      setVideoUrl("");
      setCategories([]);
      setQuestions([]);
      setEditingId(null);
      setSaving(false);
      // Refresh quiz list
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        setQuizzes(data);
      }
    } else {
      toast.error("Failed to save quiz.");
      setSaving(false);
    }
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setQuizTitle(quiz.title);
    setVideoUrl(quiz.video_url);
    setCategories(quiz.categories);
    setQuestions(
      quiz.questions.map((q) => ({
        question: q.text,
        options: q.options.map((opt) => opt.text),
        answer: q.correct ?? 0,
      }))
    );
    setEditingId(quiz.id);
  };

  const handleDeleteQuiz = async (id: string) => {
    if (!window.confirm("Delete this quiz?")) return;
    setSaving(true);
    const { error } = await supabase.from("quizzes").delete().eq("id", id);
    if (!error) {
      toast.success("Quiz deleted.");
      setQuizTitle("");
      setVideoUrl("");
      setCategories([]);
      setQuestions([]);
      setEditingId(null);
      setSaving(false);
      // Refresh quiz list
      const { data, error: fetchError } = await supabase
        .from("quizzes")
        .select("*")
        .order("created_at", { ascending: false });
      if (!fetchError && data) {
        setQuizzes(data);
      }
    } else {
      toast.error("Failed to delete quiz.");
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">
        {editingId ? "Edit Course" : "Course Creator"}
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
              disabled={mediaLoading}
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
              disabled={mediaLoading}
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
              disabled={mediaLoading}
            />
          </div>
          <div className="flex-1">
            <label className="block font-medium mb-1">URL</label>
            <Input
              value={mediaUrl}
              onChange={e => setMediaUrl(e.target.value)}
              placeholder="Paste media URL (webpage, document, audio, or video)"
              disabled={mediaLoading}
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
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteMedia(m.id)} disabled={mediaLoading}>
                    Delete
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Card>
      {/* --- Quiz Management Section --- */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">{editingId ? "Edit Quiz" : "Create New Quiz"}</h2>
        <div className="mb-4">
          <label className="block font-medium mb-1">Quiz Title</label>
          <Input
            value={quizTitle}
            onChange={e => setQuizTitle(e.target.value)}
            placeholder="Enter quiz title"
            disabled={saving}
          />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Quiz Video URL</label>
          <Input
            value={videoUrl}
            onChange={e => setVideoUrl(e.target.value)}
            placeholder="Paste YouTube video URL"
            disabled={saving}
          />
          {videoUrl && (
            <div className="aspect-w-16 aspect-h-9 mt-2">
              <iframe
                src={`https://www.youtube.com/embed/${getYoutubeId(videoUrl)}`}
                title="Quiz Video"
                allowFullScreen
                className="w-full h-48 rounded border"
              />
            </div>
          )}
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Categories</label>
          <select
            multiple
            className="w-full border rounded px-2 py-1"
            value={categories}
            onChange={e =>
              setCategories(Array.from(e.target.selectedOptions, (opt) => opt.value))
            }
            disabled={saving}
          >
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-2">Questions</label>
          {questions.map((q, qIdx) => (
            <Card key={qIdx} className="p-3 mb-2">
              <div className="mb-2 flex items-center">
                <Input
                  value={q.question}
                  onChange={e => handleQuestionChange(qIdx, e.target.value)}
                  placeholder={`Question ${qIdx + 1}`}
                  className="flex-1"
                  disabled={saving}
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="ml-2"
                  onClick={() => handleRemoveQuestion(qIdx)}
                  disabled={saving}
                >
                  Remove
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {q.options.map((opt, optIdx) => (
                  <div key={optIdx} className="flex items-center">
                    <input
                      type="radio"
                      name={`answer-${qIdx}`}
                      checked={q.answer === optIdx}
                      onChange={() => handleAnswerChange(qIdx, optIdx)}
                      disabled={saving}
                      className="mr-2"
                    />
                    <Input
                      value={opt}
                      onChange={e => handleOptionChange(qIdx, optIdx, e.target.value)}
                      placeholder={`Option ${optIdx + 1}`}
                      disabled={saving}
                    />
                  </div>
                ))}
              </div>
            </Card>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={handleAddQuestion}
            disabled={saving}
          >
            Add Question
          </Button>
        </div>
        <Button onClick={handleSaveQuiz} disabled={saving}>
          {saving ? "Saving..." : editingId ? "Update Quiz" : "Create Quiz"}
        </Button>
      </Card>
      {/* --- Quiz List Section --- */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">All Quizzes</h2>
        {loadingQuizzes ? (
          <div className="text-gray-500">Loading quizzes...</div>
        ) : quizzes.length === 0 ? (
          <div className="text-gray-500">No quizzes found.</div>
        ) : (
          <div className="space-y-2">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{quiz.title}</div>
                  <div className="text-xs text-gray-500">
                    {quiz.categories.map((cat) => CATEGORY_OPTIONS.find((c) => c.value === cat)?.label || cat).join(", ")}
                  </div>
                  <div className="text-xs text-gray-500">
                    {quiz.video_url}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEditQuiz(quiz)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteQuiz(quiz.id)}>
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

export default CourseCreator;