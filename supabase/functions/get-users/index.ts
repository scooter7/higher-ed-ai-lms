import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow admin (james@shmooze.io) to access
  const authHeader = req.headers.get("authorization") || "";
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Get the user making the request
  const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
  if (!user || user.email !== "james@shmooze.io") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  // Use the admin API to list all users
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }

  // Map to id and email only
  const users = (data?.users || []).map((u: any) => ({
    id: u.id,
    email: u.email,
  }));

  return new Response(JSON.stringify({ users }), {
    status: 200,
    headers: corsHeaders,
  });
});