import React, { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { Label } from "@/components/ui/label";

const ADMIN_EMAIL = "james@shmooze.io";

type UserProfile = {
  id: string;
  email: string;
};

type DomainStats = {
  domain: string;
  count: number;
};

const Admin = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);

  // Stats
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [domains, setDomains] = useState<DomainStats[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [quizzesTaken, setQuizzesTaken] = useState<number>(0);
  const [coursesCompleted, setCoursesCompleted] = useState<number>(0);

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

  // Fetch all users and compute domains
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      // Get the current session's access token (async!)
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token || "";
      // Call edge function to get users from auth.users
      const { data, error } = await supabase.functions.invoke("get-users", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      let userList: UserProfile[] = [];
      if (data && data.users) {
        userList = data.users;
      }
      setUsers(userList);
      // Compute domains
      const domainMap: Record<string, number> = {};
      (userList || []).forEach((u: UserProfile) => {
        const domain = u.email.split("@")[1] || "unknown";
        domainMap[domain] = (domainMap[domain] || 0) + 1;
      });
      const domainArr = Object.entries(domainMap)
        .map(([domain, count]) => ({ domain, count }))
        .sort((a, b) => b.count - a.count);
      setDomains(domainArr);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  // Fetch quizzes taken and courses completed, filtered by domain if needed
  useEffect(() => {
    const fetchStats = async () => {
      setQuizzesTaken(0);
      setCoursesCompleted(0);
      if (users.length === 0) return;

      let filteredUserIds: string[] = [];
      if (selectedDomain === "all") {
        filteredUserIds = users.map((u) => u.id);
      } else {
        filteredUserIds = users
          .filter((u) => u.email.endsWith("@" + selectedDomain))
          .map((u) => u.id);
      }
      if (filteredUserIds.length === 0) {
        setQuizzesTaken(0);
        setCoursesCompleted(0);
        return;
      }

      // Quizzes taken
      const { count: quizCount } = await supabase
        .from("quiz_scores")
        .select("id", { count: "exact", head: true })
        .in("user_id", filteredUserIds);
      setQuizzesTaken(quizCount || 0);

      // Courses completed
      const { count: courseCount } = await supabase
        .from("course_progress")
        .select("id", { count: "exact", head: true })
        .in("user_id", filteredUserIds)
        .not("completed_at", "is", null);
      setCoursesCompleted(courseCount || 0);
    };
    fetchStats();
  }, [users, selectedDomain]);

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Analytics</h1>
      <Card className="mb-8 p-6">
        <h2 className="text-xl font-semibold mb-4">User Stats</h2>
        {loading ? (
          <div className="text-gray-500">Loading users...</div>
        ) : (
          <>
            <div className="flex flex-wrap gap-6 justify-center mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{users.length}</div>
                <div className="text-gray-600">Total Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{domains.length}</div>
                <div className="text-gray-600">Unique Domains</div>
              </div>
            </div>
            <div className="mb-4">
              <Label htmlFor="domain-select" className="mr-2">Filter by Domain:</Label>
              <select
                id="domain-select"
                className="border rounded px-2 py-1"
                value={selectedDomain}
                onChange={e => setSelectedDomain(e.target.value)}
              >
                <option value="all">All Domains</option>
                {domains.map((d) => (
                  <option key={d.domain} value={d.domain}>
                    {d.domain} ({d.count})
                  </option>
                ))}
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead>
                  <tr>
                    <th className="border px-2 py-1">Domain</th>
                    <th className="border px-2 py-1">User Count</th>
                  </tr>
                </thead>
                <tbody>
                  {domains.map((d) => (
                    <tr key={d.domain}>
                      <td className="border px-2 py-1">{d.domain}</td>
                      <td className="border px-2 py-1">{d.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
      <Card className="mb-8 p-6">
        <h2 className="text-xl font-semibold mb-4">App Usage</h2>
        <div className="flex flex-wrap gap-6 justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold">{quizzesTaken}</div>
            <div className="text-gray-600">Quizzes Taken</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{coursesCompleted}</div>
            <div className="text-gray-600">Courses Completed</div>
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-4">
          Stats are filterable by user domain.
        </div>
      </Card>
    </div>
  );
};

export default Admin;