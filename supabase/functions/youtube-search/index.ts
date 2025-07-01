import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    if (!query) {
      return new Response(JSON.stringify({ error: "Missing query" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Get API key from environment variable
    const apiKey = Deno.env.get("YOUTUBE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing YOUTUBE_API_KEY" }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(
      query
    )}&key=${apiKey}`;

    const ytRes = await fetch(url);
    const ytData = await ytRes.json();

    if (!ytRes.ok) {
      return new Response(JSON.stringify({ error: ytData.error || "YouTube API error" }), {
        status: ytRes.status,
        headers: corsHeaders,
      });
    }

    // Map results to a simple format
    const results = (ytData.items || []).map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails?.default?.url || "",
    }));

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});