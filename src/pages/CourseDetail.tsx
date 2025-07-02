import { useParams } from "react-router-dom";
import { useMemo, useEffect, useState } from "react";
import { Quiz } from "@/components/Quiz";
import { supabase } from "@/lib/supabaseClient";
import { Card } from "@/components/ui/card";
import { MarkCourseComplete } from "@/components/MarkCourseComplete";

// --- Add this courseData object ---
const courseData: Record<string, {
  title: string;
  videoId: string;
  transcript: string;
  category: string;
}> = {
  "digital-marketing": {
    title: "Digital Marketing",
    videoId: "dQw4w9WgXcQ", // Replace with your actual YouTube video ID
    transcript: "This is the transcript for Digital Marketing. Replace with real content.",
    category: "digital-marketing",
  },
  "brand-strategy": {
    title: "Brand Strategy",
    videoId: "dQw4w9WgXcQ",
    transcript: "This is the transcript for Brand Strategy. Replace with real content.",
    category: "brand-strategy",
  },
  "market-research": {
    title: "Market Research",
    videoId: "dQw4w9WgXcQ",
    transcript: "This is the transcript for Market Research. Replace with real content.",
    category: "market-research",
  },
  "web-development": {
    title: "Web Development",
    videoId: "dQw4w9WgXcQ",
    transcript: "This is the transcript for Web Development. Replace with real content.",
    category: "web-development",
  },
  "social-media": {
    title: "Social Media",
    videoId: "dQw4w9WgXcQ",
    transcript: "This is the transcript for Social Media. Replace with real content.",
    category: "social-media",
  },
  "graphic-design": {
    title: "Graphic Design",
    videoId: "dQw4w9WgXcQ",
    transcript: "This is the transcript for Graphic Design. Replace with real content.",
    category: "graphic-design",
  },
  "copywriting": {
    title: "Copywriting",
    videoId: "dQw4w9WgXcQ",
    transcript: "This is the transcript for Copywriting. Replace with real content.",
    category: "copywriting",
  },
  "email-marketing": {
    title: "Email Marketing",
    videoId: "dQw4w9WgXcQ",
    transcript: "This is the transcript for Email Marketing. Replace with real content.",
    category: "email-marketing",
  },
  "text-message-marketing": {
    title: "Text Message Marketing",
    videoId: "dQw4w9WgXcQ",
    transcript: "This is the transcript for Text Message Marketing. Replace with real content.",
    category: "text-message-marketing",
  },
};

// --- rest of your component code remains unchanged ---

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const course = useMemo(() => courseId && courseData[courseId], [courseId]);
  // ... rest of the file unchanged ...
  // (keep all your useEffect, state, and rendering logic)
}

// Helper to extract YouTube ID from URL
function getYoutubeId(url: string) {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^?&]+)/
  );
  return match ? match[1] : "";
}

export default CourseDetail;