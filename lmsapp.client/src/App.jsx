import { Route, Routes, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Browse from './Pages/Browse';
import TeacherDashboard from './Pages/Dashboard/TeacherDashboard';
import AdminDashboard from './Pages/Dashboard/AdminDashboard';
import Register from './Pages/Register';
import Login from './Pages/Login';
import Profile from './pages/Profile';
import Course from './pages/Course';
import { useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import AnalyticsDashboard from './pages/Dashboard/AnalyticsDashboard';
import CoursesDashboard from './pages/Dashboard/CoursesDashboard';
import ChapterForm from './pages/teacher/ChapterForm';
import InitialCourseForm from './pages/teacher/InitialCourseForm';
// Composant de protection des routes
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  console.log('Protected Route:', {
    isAuthenticated,
    userRoles: user?.roles,
    allowedRoles,
  });

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (
    allowedRoles &&
    !allowedRoles.some((role) => user?.roles?.includes(role))
  ) {
    return <Navigate to="/" />;
  }

  return children;
};

// Composant de redirection du dashboard selon le rôle
const DashboardRouter = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case 'Teacher':
      return <Navigate to="/teacher" />;
    case 'Admin':
      return <Navigate to="/admin" />;
    default:
      return <Navigate to="/" />;
  }
};

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />

      <Layout>
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<Browse />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/courses/:courseId" element={<Course />} />

          {/* Routes Teacher */}
          <Route
            path="/teacher/*"
            element={
              <ProtectedRoute allowedRoles={['Teacher']}>
                <Routes>
                  <Route index element={<TeacherDashboard />} />

                  {/* Flux de création de cours */}
                  <Route path="courses">
                    <Route index element={<TeacherDashboard />} />
                    <Route path="new" element={<InitialCourseForm />} />{' '}
                    {/* Étape 1 */}
                    <Route
                      path=":courseId"
                      element={<CoursesDashboard />}
                    />{' '}
                    {/* Étape 2 */}
                    <Route
                      path=":courseId/chapters/new"
                      element={<ChapterForm />}
                    />{' '}
                    {/* Étape 3 */}
                  </Route>

                  <Route path="analytics" element={<AnalyticsDashboard />} />
                </Routes>
              </ProtectedRoute>
            }
          />

          {/* Routes protégées */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:courseId"
            element={
              <ProtectedRoute>
                <Course />
              </ProtectedRoute>
            }
          />

          {/* Routes Admin */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Route Dashboard avec redirection selon le rôle */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            }
          />

          {/* Route 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </>
  );
}

export default App;
