import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) return <Navigate to="/" />;

  if (adminOnly && role !== 'admin') {
    return <Navigate to="/home" />; // redirect non-admins
  }

  return children;
}
