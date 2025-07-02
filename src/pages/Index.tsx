import { MadeWithDyad } from "@/components/made-with-dyad";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="text-center max-w-xl">
        <h1 className="text-4xl font-bold mb-4">AI for Higher Ed Marketing LMS</h1>
        <p className="text-lg text-gray-700 mb-6">
          Learn how to use AI to supercharge your marketing efforts in higher education. Explore courses on digital marketing, brand strategy, market research, and more—all with video-based lessons and interactive quizzes.
        </p>
        <Link
          to="/courses"
          className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold shadow hover:bg-primary/90 transition"
        >
          View Courses
        </Link>
        <div className="mt-4">
          <Link
            to="/quiz-creator"
            className="inline-block bg-secondary text-secondary-foreground px-4 py-2 rounded-lg font-medium shadow hover:bg-secondary/80 transition"
          >
            Quiz Creator
          </Link>
        </div>
      </div>
      <div className="mt-10">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;