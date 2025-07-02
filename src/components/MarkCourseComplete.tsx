import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";

type Props = {
  courseId: string;
};

export const MarkCourseComplete: React.FC<Props> = ({ courseId }) => {
  const { user } = useUser();
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("course_progress")
        .select("completed_at")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .single();
      if (data && data.completed_at) {
        setCompleted(true);
      }
    };
    fetchProgress();
  }, [user, courseId]);

  const handleMarkComplete = async () => {
    if (!user) return;
    setLoading(true);
    // Upsert progress
    const { error } = await supabase
      .from("course_progress")
      .upsert(
        {
          user_id: user.id,
          course_id: courseId,
          completed_at: new Date().toISOString(),
        },
        { onConflict: ["user_id", "course_id"] }
      );
    setLoading(false);
    if (!error) {
      setCompleted(true);
      toast.success("Course marked as complete!");
    } else {
      toast.error("Failed to mark as complete.");
    }
  };

  if (!user) return null;

  return (
    <div className="my-4 text-center">
      {completed ? (
        <span className="text-green-600 font-semibold">Course Completed!</span>
      ) : (
        <Button onClick={handleMarkComplete} disabled={loading}>
          {loading ? "Marking..." : "Mark as Complete"}
        </Button>
      )}
    </div>
  );
};