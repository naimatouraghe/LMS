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
import Dashboard from './Pages/Dashboard';
import { Toaster } from 'react-hot-toast';
// Composant de protection des routes
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

// Composant de redirection du dashboard selon le rôle
const DashboardRouter = () => {
  const { user } = useAuth();

  switch (user.role) {
    case 'Admin':
      return <AdminDashboard />;
    case 'Teacher':
      return <TeacherDashboard />;
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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/courses/:courseId" element={<Course />} />
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

          {/* Routes Teacher */}
          <Route
            path="/teacher/*"
            element={
              <ProtectedRoute allowedRoles={['Teacher']}>
                <TeacherDashboard />
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
