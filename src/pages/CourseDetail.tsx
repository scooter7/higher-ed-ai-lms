import { useParams } from "react-router-dom";
import { useMemo } from "react";

const courseData: Record<string, { title: string; videoId: string; transcript: string }> = {
  "digital-marketing": {
    title: "Digital Marketing",
    videoId: "dQw4w9WgXcQ", // Placeholder YouTube ID
    transcript: "This is a sample transcript for Digital Marketing. AI can help automate campaigns, analyze data, and personalize student outreach.",
  },
  "brand-strategy": {
    title: "Brand Strategy",
    videoId: "dQw4w9WgXcQ",
    transcript: "This is a sample transcript for Brand Strategy. AI can help identify brand sentiment and optimize messaging.",
  },
  "market-research": {
    title: "Market Research",
    videoId: "dQw4w9WgXcQ",
    transcript: "This is a sample transcript for Market Research. Use AI to analyze trends and student preferences.",
  },
  "web-development": {
    title: "Web Development",
    videoId: "dQw4w9WgXcQ",
    transcript: "This is a sample transcript for Web Development. AI can help with accessibility and content optimization.",
  },
  "social-media": {
    title: "Social Media",
    videoId: "dQw4w9WgXcQ",
    transcript: "This is a sample transcript for Social Media. AI can schedule posts and analyze engagement.",
  },
  "graphic-design": {
    title: "Graphic Design",
    videoId: "dQw4w9WgXcQ",
    transcript: "This is a sample transcript for Graphic Design. AI tools can generate creative assets quickly.",
  },
  "copywriting": {
    title: "Copywriting",
    videoId: "dQw4w9WgXcQ",
    transcript: "This is a sample transcript for Copywriting. Use AI to brainstorm and refine your messaging.",
  },
  "email-marketing": {
    title: "Email Marketing",
    videoId: "dQw4w9WgXcQ",
    transcript: "This is a sample transcript for Email Marketing. AI can personalize content and optimize send times.",
  },
  "text-message-marketing": {
    title: "Text Message Marketing",
    videoId: "dQw4w9WgXcQ",
    transcript: "This is a sample transcript for Text Message Marketing. AI can segment audiences and automate responses.",
  },
};

const quizQuestions: Record<string, { question: string; options: string[]; answer: number }[]> = {
  "digital-marketing": [
    {
      question: "How can AI help in digital marketing for higher education?",
      options: [
        "Automate campaigns",
        "Analyze data",
        "Personalize outreach",
        "All of the above",
      ],
      answer: 3,
    },
  ],
  // Add more questions for other courses as needed
};

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const course = useMemo(() => courseId && courseData[courseId], [courseId]);
  const questions = quizQuestions[courseId || ""] || [];

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
        <h2 className="text-xl font-semibold mb-2">Quiz</h2>
        {questions.length === 0 ? (
          <p className="text-gray-500">Quiz coming soon!</p>
        ) : (
          <ul className="space-y-6">
            {questions.map((q, idx) => (
              <li key={idx} className="bg-white p-4 rounded shadow border">
                <div className="font-medium mb-2">{q.question}</div>
                <ul>
                  {q.options.map((opt, i) => (
                    <li key={i}>
                      <label className="flex items-center space-x-2">
                        <input type="radio" name={`q${idx}`} disabled />
                        <span>{opt}</span>
                      </label>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 text-xs text-green-600">
                  Correct answer: {q.options[q.answer]}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-8 text-center">
        <a href="/courses" className="text-blue-500 underline">Back to Courses</a>
      </div>
    </div>
  );
};

export default CourseDetail;