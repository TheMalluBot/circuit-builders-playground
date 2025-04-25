
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react"; 
import Index from "./pages/Index";
import LessonsPage from "./pages/LessonsPage";
import LessonPage from "./pages/LessonPage";
import PlaygroundPage from "./pages/PlaygroundPage";
import NotFound from "./pages/NotFound";

// Admin imports
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import LessonsManagement from "./pages/admin/LessonsManagement";
import ContentEditor from "./pages/admin/ContentEditor";
import LessonEditor from "./pages/admin/LessonEditor"; // New import
import NewLesson from "./pages/admin/NewLesson"; // New import

const queryClient = new QueryClient();

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/lessons/:category" element={<LessonsPage />} />
            <Route path="/lessons/:slug" element={<LessonPage />} />
            <Route path="/playground" element={<PlaygroundPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="lessons" element={<LessonsManagement />} />
              <Route path="lessons/new" element={<NewLesson />} />
              <Route path="lessons/:id/edit" element={<LessonEditor />} />
              <Route path="content-editor" element={<ContentEditor />} />
              <Route path="simulations" element={<LessonsManagement />} /> {/* Placeholder - same component for now */}
              <Route path="learning-paths" element={<LessonsManagement />} /> {/* Placeholder - same component for now */}
              <Route path="media" element={<LessonsManagement />} /> {/* Placeholder - same component for now */}
              <Route path="users" element={<LessonsManagement />} /> {/* Placeholder - same component for now */}
              <Route path="reports" element={<LessonsManagement />} /> {/* Placeholder - same component for now */}
              <Route path="settings" element={<LessonsManagement />} /> {/* Placeholder - same component for now */}
              <Route path="docs" element={<LessonsManagement />} /> {/* Placeholder - same component for now */}
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
