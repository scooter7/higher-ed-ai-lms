...
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
...