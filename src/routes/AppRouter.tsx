import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import AdminCourses from "@/pages/admin/Courses";
import AdminHome from "@/pages/admin/Home";
import AdminLayout from "@/layouts/AdminLayout";
import AdminUsers from "@/pages/admin/Users";
import AllCourses from "@/pages/AllCourses";
import AssignmentDetails from "@/pages/AssignmentDetails";
import Assignments from "@/pages/Assignments";
import CourseDetails from "@/pages/CourseDetails";
import CourseRegistration from "@/pages/CourseRegistration";
import CourseStudents from "@/pages/CourseStudents";
import Forum from "@/pages/Forum";
import Home from "../pages/Home";
import InstructorCourses from "@/pages/Forum";
import InstructorForum from "@/pages/Forum";
import InstructorQuiz from "@/pages/Forum";
import Login from "../pages/Login";
import Materials from "@/pages/Materials";
import MyCourses from "@/pages/UserCourses";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "../routes/ProtectedRoute";
import Quiz from "@/pages/Quiz";
import React from "react";
import Signup from "@/pages/Signup";
import Welcome from "@/pages/Welcome";

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<NotFound />} />

        {/* Student Routes */}
        <Route
          path="/student/*"
          element={
            <ProtectedRoute role={"student"}>
              <Routes>
                <Route path="home" element={<Home />} />
                <Route path="mycourses" element={<MyCourses />} />
                <Route path="assignments" element={<Assignments />} />
                <Route
                  path="assignments/:assignmentId"
                  element={<AssignmentDetails />}
                />
                <Route path="courses/:courseId" element={<CourseDetails />} />
                <Route
                  path="courses/:courseId/materials"
                  element={<Materials />}
                />
                <Route
                  path="courses/:courseId/assignments"
                  element={<Assignments />}
                />
                <Route path="courses/:courseId/quiz" element={<Quiz />} />
                <Route path="courses/:courseId/forum" element={<Forum />} />
                <Route path="allcourses" element={<AllCourses />} />
                <Route
                  path="courses/:courseId/register"
                  element={<CourseRegistration />}
                />
              </Routes>
            </ProtectedRoute>
          }
        />

        {/* Instructor Routes */}
        <Route
          path="/instructor/*"
          element={
            <ProtectedRoute role="instructor">
              <Routes>
                <Route path="home" element={<MyCourses />} />
                <Route path="courses" element={<InstructorCourses />} />
                <Route path="courses/:courseId" element={<CourseDetails />} />
                <Route
                  path="courses/:courseId/materials"
                  element={<Materials />}
                />
                <Route
                  path="courses/:courseId/assignments"
                  element={<Assignments />}
                />
                <Route
                  path="courses/:courseId/quiz"
                  element={<InstructorQuiz />}
                />
                <Route
                  path="courses/:courseId/students"
                  element={<CourseStudents />}
                />
                <Route
                  path="courses/:courseId/forum"
                  element={<InstructorForum />}
                />
                <Route
                  path="assignments/:assignmentId"
                  element={<AssignmentDetails />}
                />
              </Routes>
            </ProtectedRoute>
          }
        />

        {/* Admin Route */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout>
                <Routes>
                  <Route path="home" element={<AdminHome />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="courses" element={<AdminCourses />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default AppRouter;
