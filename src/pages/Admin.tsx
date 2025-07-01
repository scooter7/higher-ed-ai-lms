import React, { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const ADMIN_EMAIL = "james@shmooze.io"; // Updated admin email

type VideoResult = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
};

const Admin = () => {
  const { user } = useUser();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<VideoResult[]>([]);
  const [selected, setSelected] = useState<VideoResult | null>(null);
  const [transcript, setTranscript] = useState("");
  const [quiz, setQuiz] = useState<string[]>([]);
  const [analytics, setAnalytics] = useState({
    logins: 0,
    videosWatched: 0,
    quizzesTaken: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Real YouTube video search using edge function
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults([]);
    setSelected(null);
    setTranscript("");
    setQuiz([]);
    try {
      const res = await fetch(
        "https://omviqylasysbpoiosapy.supabase.co/functions/v1/youtube-search",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: search }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to search videos.");
      } else {
        setResults(data.results || []);
      }
    } catch (err) {
      setError("Network error.");
    }
    setLoading(false);
  };

  // Placeholder: Simulate transcript fetch
  const handleGetTranscript = () => {
    setTranscript(
      `Transcript for video "${selected?.title}" (AI-generated placeholder).`
    );
  };

  // Placeholder: Simulate quiz generation
  const handleGenerateQuiz = () => {
    setQuiz([
      "What is the main topic of this video?",
      "Name one key takeaway from the video.",
    ]);
  };

  // Placeholder: Simulate analytics fetch
  React.useEffect(() => {
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

      {/* Video Search */}
      <Card className="mb-8 p-6">
        <h2 className="text-xl font-semibold mb-4">Search for Videos</h2>
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <Input
            placeholder="Search YouTube videos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !search.trim()}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </form>
        {error && (
          <div className="text-red-600 mb-2 text-center">{error}</div>
        )}
        <div className="grid gap-4">
          {results.map((video) => (
            <div
              key={video.id}
              className={`flex items-center gap-4 p-2 border rounded cursor-pointer hover:bg-gray-50 ${
                selected?.id === video.id ? "border-primary" : "border-gray-200"
              }`}
              onClick={() => setSelected(video)}
            >
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-20 h-12 object-cover rounded"
              />
              <div>
                <div className="font-semibold">{video.title}</div>
                <div className="text-gray-500 text-sm">{video.description}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Transcript & Quiz */}
      {selected && (
        <Card className="mb-8 p-6">
          <h2 className="text-xl font-semibold mb-4">
            Selected Video: {selected.title}
          </h2>
          <Button onClick={handleGetTranscript} className="mb-4">
            Get Transcript (AI)
          </Button>
          {transcript && (
            <div className="bg-gray-50 p-4 rounded border mb-4">
              <div className="font-semibold mb-2">Transcript</div>
              <div>{transcript}</div>
            </div>
          )}
          <Button onClick={handleGenerateQuiz} className="mb-4">
            Generate Quiz (AI)
          </Button>
          {quiz.length > 0 && (
            <div className="bg-gray-50 p-4 rounded border">
              <div className="font-semibold mb-2">Quiz Questions</div>
              <ul className="list-disc pl-5">
                {quiz.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default Admin;