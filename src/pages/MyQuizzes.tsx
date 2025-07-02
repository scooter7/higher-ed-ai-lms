import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/lib/supabaseClient";

type QuizScore = {
  id: string;
  course_id: string;
  score: number;
  total: number;
  taken_at: string;
};

const courseTitles: Record<string, string> = {
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

const MyQuizzes: React.FC = () => {
  const { user } = useUser();
  const [scores, setScores] = useState<QuizScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("quiz_scores")
        .select("*")
        .eq("user_id", user.id)
        .order("taken_at", { ascending: false });
      if (!error && data) {
        setScores(data);
      }
      setLoading(false);
    };
    fetchScores();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8">
          <div className="text-xl font-semibold text-center">
            Please log in to view your quizzes.
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">My Quizzes</h1>
      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : scores.length === 0 ? (
        <Card className="p-6 text-center text-gray-500">
          You haven't taken any quizzes yet.
        </Card>
      ) : (
        <div className="space-y-4">
          {scores.map((score) => (
            <Card key={score.id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-semibold">
                  {courseTitles[score.course_id] || score.course_id}
                </div>
                <div className="text-gray-500 text-sm">
                  Taken: {new Date(score.taken_at).toLocaleString()}
                </div>
              </div>
              <div className="mt-2 md:mt-0 text-lg font-bold text-primary">
                {score.score} / {score.total}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyQuizzes;