import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Home() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const token = localStorage.getItem('token');

  const fetchAlerts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/alerts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter alerts relevant to user: active and visible
      const userAlerts = res.data.filter(a => a.active); // can enhance later by teams/users
      setAlerts(userAlerts);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!token) navigate('/');
    fetchAlerts();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Hello, User</h1>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded mb-4"
      >
        Logout
      </button>

      <h2 className="text-xl font-bold mb-2">Active Alerts</h2>
      <ul>
        {alerts.map(a => (
          <li key={a._id} className="mb-2 border-b pb-2">
            <strong>{a.title}</strong> - {a.severity}
          </li>
        ))}
      </ul>
    </div>
  );
}
