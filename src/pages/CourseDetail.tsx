import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Quiz } from "@/components/Quiz";
import { supabase } from "@/lib/supabaseClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { useActivityProgress } from "@/hooks/useActivityProgress";
import { toast } from "sonner";

// Types
type QuizType = {
  id: string;
  title: string;
  video_url: string;
  categories: string[];
  questions: {
    text: string;
    options: { text: string }[];
    correct: number | null;
  }[];
};

type Media = {
  id: string;
  course_id: string;
  type: "video" | "reading" | "podcast";
  title: string;
  url: string;
  created_at: string;
  transcript?: string;
};

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [quizzes, setQuizzes] = useState<QuizType[]>([]);
  const [loading, setLoading] = useState(true);

  // Media state
  const [media, setMedia] = useState<Media[]>([]);
  const [mediaLoading, setMediaLoading] = useState(true);

  const { user } = useUser();
  const { completed, loading: progressLoading, markComplete } = useActivityProgress(courseId || "");

  // For auto-marking course complete
  const [courseCompleted, setCourseCompleted] = useState(false);

  // Fetch quizzes for this course
  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!courseId) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .contains("categories", [courseId]);
      if (!error && data) {
        setQuizzes(data);
      } else {
        setQuizzes([]);
      }
      setLoading(false);
    };
    fetchQuizzes();
  }, [courseId]);

  // Fetch all media for this course
  useEffect(() => {
    const fetchMedia = async () => {
      if (!courseId) return;
      setMediaLoading(true);
      const { data, error } = await supabase
        .from("course_media")
        .select("*")
        .eq("course_id", courseId)
        .order("created_at", { ascending: false });
      if (!error && data) {
        setMedia(data);
      } else {
        setMedia([]);
      }
      setMediaLoading(false);
    };
    fetchMedia();
  }, [courseId]);

  // Check if all activities and quizzes are complete, then mark course as complete
  useEffect(() => {
    if (!user || !courseId) return;
    if (mediaLoading || loading || progressLoading) return;

    const allMediaIds = media.map((m) => `media:${m.id}`);
    const allQuizIds = quizzes.map((q) => `quiz:${q.id}`);
    const allIds = [...allMediaIds, ...allQuizIds];

    const allComplete = allIds.length > 0 && allIds.every((id) => completed[id]);
    if (allComplete && !courseCompleted) {
      // Mark course as complete
      supabase
        .from("course_progress")
        .upsert(
          {
            user_id: user.id,
            course_id: courseId,
            completed_at: new Date().toISOString(),
          },
          { onConflict: ["user_id", "course_id"] }
        )
        .then(({ error }) => {
          if (!error) {
            setCourseCompleted(true);
            toast.success("Course marked as complete!");
          } else {
            console.error("Failed to upsert course_progress:", error);
            toast.error("Failed to mark course as complete.");
          }
        });
    }
  }, [user, courseId, media, quizzes, completed, mediaLoading, loading, progressLoading, courseCompleted]);

  // Check if course is already marked complete
  useEffect(() => {
    if (!user || !courseId) return;
    supabase
      .from("course_progress")
      .select("completed_at")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .single()
      .then(({ data }) => {
        if (data && data.completed_at) setCourseCompleted(true);
      });
  }, [user, courseId]);

  // Get course title from media or quizzes, fallback to courseId
  const courseTitle =
    media[0]?.course_id
      ? getCourseLabel(media[0].course_id)
      : quizzes[0]?.categories[0]
      ? getCourseLabel(quizzes[0].categories[0])
      : courseId || "Course";

  // Group media by type
  const videos = media.filter((m) => m.type === "video");
  const readings = media.filter((m) => m.type === "reading");
  const podcasts = media.filter((m) => m.type === "podcast");

  // Find transcript if any media has it
  const transcript = media.find((m) => m.transcript)?.transcript;

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">{courseTitle}</h1>
      {/* --- Course Completion Status --- */}
      <div className="my-4 text-center">
        {courseCompleted ? (
          <span className="text-green-600 font-semibold">Course Completed!</span>
        ) : (
          <span className="text-gray-600">Complete all activities and quizzes to finish the course.</span>
        )}
      </div>
      {/* --- Media Section --- */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Course Media</h2>
        {mediaLoading ? (
          <div className="text-gray-500">Loading media...</div>
        ) : (
          <div className="space-y-4">
            {videos.length > 0 && (
              <div>
                <h3 className="font-semibold mb-1">Videos</h3>
                <ul className="list-disc pl-5">
                  {videos.map((m) => {
                    const key = `media:${m.id}`;
                    return (
                      <li key={m.id} className="mb-2 flex items-center gap-2">
                        <div className="flex-1">
                          <div className="font-medium">{m.title}</div>
                          <div>
                            <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                              {m.url}
                            </a>
                          </div>
                          {m.url.includes("youtube.com") || m.url.includes("youtu.be") ? (
                            <div className="aspect-w-16 aspect-h-9 mt-2">
                              <iframe
                                src={`https://www.youtube.com/embed/${getYoutubeId(m.url)}`}
                                title={m.title}
                                allowFullScreen
                                className="w-full h-48 rounded border"
                              />
                            </div>
                          ) : null}
                        </div>
                        <Button
                          size="sm"
                          variant={completed[key] ? "success" : "outline"}
                          disabled={completed[key]}
                          onClick={() => markComplete(m.id, "media")}
                        >
                          {completed[key] ? "Completed" : "Mark Complete"}
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {readings.length > 0 && (
              <div>
                <h3 className="font-semibold mb-1">Readings</h3>
                <ul className="list-disc pl-5">
                  {readings.map((m) => {
                    const key = `media:${m.id}`;
                    return (
                      <li key={m.id} className="mb-2 flex items-center gap-2">
                        <div className="flex-1">
                          <div className="font-medium">{m.title}</div>
                          <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                            {m.url}
                          </a>
                        </div>
                        <Button
                          size="sm"
                          variant={completed[key] ? "success" : "outline"}
                          disabled={completed[key]}
                          onClick={() => markComplete(m.id, "media")}
                        >
                          {completed[key] ? "Completed" : "Mark Complete"}
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {podcasts.length > 0 && (
              <div>
                <h3 className="font-semibold mb-1">Podcasts</h3>
                <ul className="list-disc pl-5">
                  {podcasts.map((m) => {
                    const key = `media:${m.id}`;
                    return (
                      <li key={m.id} className="mb-2 flex items-center gap-2">
                        <div className="flex-1">
                          <div className="font-medium">{m.title}</div>
                          <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                            {m.url}
                          </a>
                          {m.url.match(/\.(mp3|wav|ogg)$/) ? (
                            <audio controls src={m.url} className="mt-2 w-full" />
                          ) : null}
                        </div>
                        <Button
                          size="sm"
                          variant={completed[key] ? "success" : "outline"}
                          disabled={completed[key]}
                          onClick={() => markComplete(m.id, "media")}
                        >
                          {completed[key] ? "Completed" : "Mark Complete"}
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {videos.length === 0 && readings.length === 0 && podcasts.length === 0 && (
              <div className="text-gray-500">No media found for this course.</div>
            )}
          </div>
        )}
      </div>
      {/* --- Transcript Section (only if available) --- */}
      {transcript && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Transcript</h2>
          <p className="bg-gray-50 p-4 rounded border text-gray-700">{transcript}</p>
        </div>
      )}
      {/* --- Quizzes Section --- */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Quizzes</h2>
        {loading ? (
          <div className="text-gray-500">Loading quizzes...</div>
        ) : quizzes.length === 0 ? (
          <p className="text-gray-500">No quizzes available for this course yet.</p>
        ) : (
          quizzes.map((quiz) => {
            const key = `quiz:${quiz.id}`;
            return (
              <Card key={quiz.id} className="mb-6 p-4">
                <div className="mb-2 font-bold text-lg">{quiz.title}</div>
                {quiz.video_url && (
                  <div className="aspect-w-16 aspect-h-9 mb-4">
                    <iframe
                      src={`https://www.youtube.com/embed/${getYoutubeId(quiz.video_url)}`}
                      title={quiz.title}
                      allowFullScreen
                      className="w-full h-64 rounded border"
                    />
                  </div>
                )}
                <Quiz
                  questions={quiz.questions.map((q) => ({
                    question: q.text,
                    options: q.options.map((opt) => opt.text),
                    answer: q.correct ?? 0,
                  }))}
                  courseId={courseId}
                />
                <div className="mt-2 text-right">
                  <Button
                    size="sm"
                    variant={completed[key] ? "success" : "outline"}
                    disabled={completed[key]}
                    onClick={() => markComplete(quiz.id, "quiz")}
                  >
                    {completed[key] ? "Completed" : "Mark Complete"}
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>
      <div className="mt-8 text-center">
        <a href="/courses" className="text-blue-500 underline">Back to Courses</a>
      </div>
    </div>
  );
};

// Helper to extract YouTube ID from URL
function getYoutubeId(url: string) {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^?&]+)/
  );
  return match ? match[1] : "";
}

// Helper to get course label from id
function getCourseLabel(id: string) {
  const map: Record<string, string> = {
    "digital-marketing": "Digital Marketing",
    "brand-strategy": "Brand Strategy",
    "market-research": "Market Research",
    "web-development": "Web Development",
    "social-media": "Social Media",
    "graphic-design": "Graphic Design",
    "copywriting": "Copywriting",
    "email-marketing": "Email Marketing",
    "text-message-marketing": "Text Message Marketing",
  };
  return map[id] || id;
}

export default CourseDetail;