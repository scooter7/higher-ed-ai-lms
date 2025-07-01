import { Link } from "react-router-dom";

const courses = [
  {
    id: "digital-marketing",
    title: "Digital Marketing",
    description: "Learn how to leverage AI in digital marketing for higher education.",
  },
  {
    id: "brand-strategy",
    title: "Brand Strategy",
    description: "Develop a strong brand strategy using AI tools.",
  },
  {
    id: "market-research",
    title: "Market Research",
    description: "Use AI to conduct effective market research in higher ed.",
  },
  {
    id: "web-development",
    title: "Web Development",
    description: "Modern web development techniques for higher ed marketers.",
  },
  {
    id: "social-media",
    title: "Social Media",
    description: "AI-powered social media strategies.",
  },
  {
    id: "graphic-design",
    title: "Graphic Design",
    description: "Create stunning graphics with AI assistance.",
  },
  {
    id: "copywriting",
    title: "Copywriting",
    description: "Write compelling copy using AI tools.",
  },
  {
    id: "email-marketing",
    title: "Email Marketing",
    description: "Boost your email campaigns with AI.",
  },
  {
    id: "text-message-marketing",
    title: "Text Message Marketing",
    description: "Engage students with AI-driven SMS marketing.",
  },
];

const Courses = () => (
  <div className="max-w-3xl mx-auto py-10">
    <h1 className="text-3xl font-bold mb-6 text-center">Courses</h1>
    <div className="grid gap-6">
      {courses.map((course) => (
        <Link
          key={course.id}
          to={`/courses/${course.id}`}
          className="block bg-white rounded-lg shadow hover:shadow-lg transition p-6 border border-gray-200 hover:border-primary"
        >
          <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
          <p className="text-gray-600">{course.description}</p>
        </Link>
      ))}
    </div>
  </div>
);

export default Courses;