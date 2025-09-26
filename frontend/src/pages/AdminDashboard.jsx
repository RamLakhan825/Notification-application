import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-50">
      {/* Main Content */}
      <div className="p-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-4 rounded-lg shadow-lg transition duration-300 font-semibold"
            onClick={() => navigate('/admin/create-alert')}
          >
            Create Alert
          </button>
          <button
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg transition duration-300 font-semibold"
            onClick={() => navigate('/admin/manage-alerts')}
          >
            Manage Alerts
          </button>
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-4 rounded-lg shadow-lg transition duration-300 font-semibold"
            onClick={() => navigate('/admin/view-alerts')}
          >
            View Alerts
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg shadow font-semibold transition duration-300"
        >
          Logout
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-gray-200 p-4 text-center text-gray-700 text-sm">
        &copy; {new Date().getFullYear()} MyAlertSystem. All rights reserved.
      </footer>
    </div>
  );
}
