import React, { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Card } from "@/components/ui/card";

const ADMIN_EMAIL = "james@shmooze.io"; // Updated admin email

const Admin = () => {
  const { user } = useUser();
  const [analytics, setAnalytics] = useState({
    logins: 0,
    videosWatched: 0,
    quizzesTaken: 0,
  });

  // Restrict access to admin
  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8">
          <div className="text-xl font-semibold text-center">
            Access Denied
          </div>
          <div className="text-gray-500 mt-2 text-center">
            You do not have permission to view this page.
          </div>
        </Card>
      </div>
    );
  }

  // Placeholder: Simulate analytics fetch
  useEffect(() => {
    setAnalytics({
      logins: 42,
      videosWatched: 123,
      quizzesTaken: 56,
    });
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Interface</h1>

      {/* Analytics */}
      <Card className="mb-8 p-6">
        <h2 className="text-xl font-semibold mb-4">App Analytics</h2>
        <div className="flex flex-wrap gap-6 justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold">{analytics.logins}</div>
            <div className="text-gray-600">Logins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{analytics.videosWatched}</div>
            <div className="text-gray-600">Videos Watched</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{analytics.quizzesTaken}</div>
            <div className="text-gray-600">Quizzes Taken</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Admin;