import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import CreateAlertPage from './pages/CreateAlertPage';
import ManageAlertsPage from './pages/ManageAlertsPage';
import ViewAlertsPage from './pages/ViewAlertsPage';
import PrivateRoute from './utils/PrivateRoute.jsx';
import UserDashboard from './pages/UserDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Role-based protected routes */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <UserDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <PrivateRoute adminOnly={true}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/create-alert"
          element={
            <PrivateRoute adminOnly={true}>
              <CreateAlertPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/manage-alerts"
          element={
            <PrivateRoute adminOnly={true}>
              <ManageAlertsPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/view-alerts"
          element={
            <PrivateRoute adminOnly={true}>
              <ViewAlertsPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
