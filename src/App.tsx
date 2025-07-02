import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Admin from "./pages/Admin";
import { UserProvider, useUser } from "@/contexts/UserContext";
import { AuthForm } from "@/components/AuthForm";
import CourseCreator from "./pages/CourseCreator";
import MyQuizzes from "./pages/MyQuizzes";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, loading } = useUser();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <>
      {/* Dev: Link to admin page */}
      <div className="fixed top-2 right-2 z-50">
        <Link
          to="/admin"
          className="bg-secondary px-3 py-1 rounded text-sm font-medium shadow hover:bg-secondary/80"
        >
          Admin
        </Link>
      </div>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:courseId" element={<CourseDetail />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/course-creator" element={<CourseCreator />} />
        <Route path="/my-quizzes" element={<MyQuizzes />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <UserProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;