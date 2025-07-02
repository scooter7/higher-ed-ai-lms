import { useParams } from "react-router-dom";
import { useMemo, useEffect, useState } from "react";
import { Quiz } from "@/components/Quiz";
import { supabase } from "@/lib/supabaseClient";
import { Card } from "@/components/ui/card";

const courseData: Record<string, { title: string; videoId: string; transcript: string; category: string }> = {
  "digital-marketing": {
    title: "Digital Marketing",
    videoId: "dQw4w9WgXcQ",
    transcript: "This is a sample transcript for Digital Marketing. AI can help automate campaigns, analyze data, and personalize student outreach.",
    category: "digital-marketing",
  },
  "brand-strategy": {
    title: "Brand Strategy",
    videoId: "dQw4w9WgXcQ",
    transcript: "This is a sample transcript for Brand Strategy. AI can help identify brand sentiment and optimize messaging.",
    category: "brand-strategy",
  },
  "market-research": {
    title: "Market Research",
    videoId: "dQw4w9WgXcQ",
    transcript: "This is a sample transcript for Market Research. Use AI to analyze trends and student preferences.",
    category: "market-research",
  },
  "web-development": {
    title: "Web Development",
    videoId: "dQw4w9WgXcQ",
    transcript: "This is a sample transcript for Web Development. AI can help with accessibility and content optimization.",
    category: "web-development",
  },
  "social-media": {
    title: "Social Media",
    videoId: "dQw4w9WgXcQ",
    transcript: "This is a sample transcript for Social Media. AI can schedule posts and analyze engagement.",
    category: "social-media",
  },
  "graphic-design": {
    title: "Graphic Design",
    videoId: "dQw4w9WgXcQ",
    transcript: "This is a sample transcript for Graphic Design. AI tools can generate creative assets quickly.",
    category: "graphic-design",
  },
  "copywriting": {
    title: "Copywriting",
    videoId: "dQw4w9WgXcQ",
    transcript: "This is a sample transcript for Copywriting. Use AI to brainstorm and refine your messaging.",
    category: "copywriting",
  },
  "email-marketing": {
    title: "Email Marketing",
    videoId: "dQw4w9WgXcQ",
    transcript: "This is a sample transcript for Email Marketing. AI can personalize content and optimize send times.",
    category: "email-marketing",
  },
  "text-message-marketing": {
    title: "Text Message Marketing",
    videoId: "dQw4w9WgXcQ",
    transcript: "This is a sample transcript for Text Message Marketing. AI can segment audiences and automate responses.",
    category: "text-message-marketing",
  },
};

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

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const course = useMemo(() => courseId && courseData[courseId], [courseId]);
  const [quizzes, setQuizzes] = useState<QuizType[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (!course) {
    return (
      <div className="max-w-xl mx-auto py-10 text-center">
        <h2 className="text-2xl font-bold mb-4">Course Not Found</h2>
        <a href="/courses" className="text-blue-500 underline">Back to Courses</a>
      </div>
    );
  }

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
};

// Helper to extract YouTube ID from URL
function getYoutubeId(url: string) {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^?&]+)/
  );
  return match ? match[1] : "";
}

export default CourseDetail;