
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import LessonsPage from './pages/LessonsPage';
import LessonPage from './pages/LessonPage';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/admin/AdminDashboard';
import LessonsManagement from './pages/admin/LessonsManagement';
import LessonEditor from './pages/admin/LessonEditor';
import NewLesson from './pages/admin/NewLesson';
import ContentEditor from './pages/admin/ContentEditor';
import PlaygroundPage from './pages/PlaygroundPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/lessons" element={<LessonsPage />} />
        <Route path="/lessons/:id" element={<LessonPage />} />
        <Route path="/playground" element={<PlaygroundPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/lessons" element={<LessonsManagement />} />
        <Route path="/admin/lessons/new" element={<NewLesson />} />
        <Route path="/admin/lessons/:id" element={<LessonEditor />} />
        <Route path="/admin/content" element={<ContentEditor />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
