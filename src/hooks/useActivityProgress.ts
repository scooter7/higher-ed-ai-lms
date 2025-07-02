import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@/contexts/UserContext";

export type ActivityType = "media" | "quiz";

export function useActivityProgress(courseId: string) {
  const { user } = useUser();
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("activity_progress")
      .select("activity_id, activity_type")
      .eq("user_id", user.id)
      .eq("course_id", courseId);
    if (!error && data) {
      const map: Record<string, boolean> = {};
      data.forEach((row: any) => {
        map[`${row.activity_type}:${row.activity_id}`] = true;
      });
      setCompleted(map);
    }
    setLoading(false);
  }, [user, courseId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const markComplete = async (activityId: string, activityType: ActivityType) => {
    if (!user) return;
    await supabase.from("activity_progress").upsert({
      user_id: user.id,
      course_id: courseId,
      activity_id: activityId,
      activity_type: activityType,
      completed_at: new Date().toISOString(),
    });
    await fetchProgress();
  };

  return { completed, loading, markComplete };
}