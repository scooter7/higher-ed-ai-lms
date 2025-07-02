import { useParams } from "react-router-dom";
import { useMemo, useEffect, useState } from "react";
import { Quiz } from "@/components/Quiz";
import { supabase } from "@/lib/supabaseClient";
import { Card } from "@/components/ui/card";
import { MarkCourseComplete } from "@/components/MarkCourseComplete"; // <-- Add this import

// ... rest of the file remains unchanged

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const course = useMemo(() => courseId && courseData[courseId], [courseId]);
  const [quizzes, setQuizzes] = useState<QuizType[]>([]);
  const [loading, setLoading] = useState(true);

  // Media state
  const [media, setMedia] = useState<Media[]>([]);
  const [mediaLoading, setMediaLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!course) return;
      setLoading(true);
      // Fetch quizzes where the course's category is included in the quiz's categories array
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .contains("categories", [course.category]);
      if (!error && data) {
        setQuizzes(data);
      } else {
        setQuizzes([]);
      }
      setLoading(false);
    };
    fetchQuizzes();
  }, [course]);

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

  if (!course) {
    return (
      <div className="max-w-xl mx-auto py-10 text-center">
        <h2 className="text-2xl font-bold mb-4">Course Not Found</h2>
        <a href="/courses" className="text-blue-500 underline">Back to Courses</a>
      </div>
    );
  }

  // Group media by type
  const videos = media.filter((m) => m.type === "video");
  const readings = media.filter((m) => m.type === "reading");
  const podcasts = media.filter((m) => m.type === "podcast");

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">{course.title}</h1>
      <div className="mb-6">
        <div className="aspect-w-16 aspect-h-9 mb-4">
          <iframe
            src={`https://www.youtube.com/embed/${course.videoId}`}
            title={course.title}
            allowFullScreen
            className="w-full h-64 rounded-lg border"
          />
        </div>
        <h2 className="text-xl font-semibold mb-2">Transcript</h2>
        <p className="bg-gray-50 p-4 rounded border text-gray-700">{course.transcript}</p>
      </div>
      {/* --- Mark as Complete Button --- */}
      <MarkCourseComplete courseId={courseId!} />
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
                  {videos.map((m) => (
                    <li key={m.id} className="mb-2">
                      <div className="font-medium">{m.title}</div>
                      <div>
                        <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                          {m.url}
                        </a>
                      </div>
                      {/* If YouTube, show preview */}
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
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {readings.length > 0 && (
              <div>
                <h3 className="font-semibold mb-1">Readings</h3>
                <ul className="list-disc pl-5">
                  {readings.map((m) => (
                    <li key={m.id} className="mb-2">
                      <div className="font-medium">{m.title}</div>
                      <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                        {m.url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {podcasts.length > 0 && (
              <div>
                <h3 className="font-semibold mb-1">Podcasts</h3>
                <ul className="list-disc pl-5">
                  {podcasts.map((m) => (
                    <li key={m.id} className="mb-2">
                      <div className="font-medium">{m.title}</div>
                      <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                        {m.url}
                      </a>
                      {/* If it's a direct audio link, show audio player */}
                      {m.url.match(/\.(mp3|wav|ogg)$/) ? (
                        <audio controls src={m.url} className="mt-2 w-full" />
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {videos.length === 0 && readings.length === 0 && podcasts.length === 0 && (
              <div className="text-gray-500">No media found for this course.</div>
            )}
          </div>
        )}
      </div>
      {/* --- Quizzes Section --- */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Quizzes</h2>
        {loading ? (
          <div className="text-gray-500">Loading quizzes...</div>
        ) : quizzes.length === 0 ? (
          <p className="text-gray-500">No quizzes available for this category yet.</p>
        ) : (
          quizzes.map((quiz) => (
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
            </Card>
          ))
        )}
      </div>
      <div className="mt-8 text-center">
        <a href="/courses" className="text-blue-500 underline">Back to Courses</a>
      </div>
    </div>
  );
}

// Helper to extract YouTube ID from URL
function getYoutubeId(url: string) {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^?&]+)/
  );
  return match ? match[1] : "";
}

export default CourseDetail;