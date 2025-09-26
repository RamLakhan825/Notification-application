import { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

export default function UserDashboard() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAlerts();

    const socket = io('https://notification-application.onrender.com/');
    if (userId) {
      socket.emit('join', userId); // join user-specific room
    }

    socket.on('newAlert', (alert) => {
      setAlerts((prev) => [alert, ...prev]);
      alertNotification(alert);
    });

    return () => socket.disconnect();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await axios.get('https://notification-application.onrender.com/api/user/alerts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlerts(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const alertNotification = (alert) => {
    if (Notification.permission === 'granted') {
      new Notification(alert.title, { body: alert.message });
    }
  };

  useEffect(() => {
    if (Notification.permission !== 'granted') Notification.requestPermission();
  }, []);

  const handleSnooze = async (id) => {
    try {
      await axios.post(
        `https://notification-application.onrender.com/api/user/alerts/${id}/snooze`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAlerts((alerts) =>
        alerts.map((a) =>
          a._id === id
            ? { ...a, snoozedBy: [...(a.snoozedBy || []), userId] }
            : a
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await axios.post(
        `https://notification-application.onrender.com/api/user/alerts/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAlerts((alerts) =>
        alerts.map((a) =>
          a._id === id
            ? { ...a, readBy: [...(a.readBy || []), userId] }
            : a
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (loading) return <p className="p-8 text-center">Loading alerts...</p>;
  if (error) return <p className="p-8 text-center text-red-500">{error}</p>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Alerts</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alerts.map((a) => {
          const isRead = a.readBy?.includes(userId);
          const isSnoozed = a.snoozedBy?.includes(userId);

          return (
            <div
              key={a._id}
              className={`p-4 rounded shadow ${
                isRead ? 'bg-gray-100' : 'bg-white'
              }`}
            >
              <h2 className="font-semibold">{a.title}</h2>
              <p>{a.message}</p>
              <p>
                <strong>Severity:</strong> {a.severity}
              </p>
              <p>
                <strong>Expiry:</strong>{' '}
                {a.expiryTime
                  ? new Date(a.expiryTime).toLocaleString()
                  : 'N/A'}
              </p>

              <div className="flex gap-2 mt-2">
                {isRead ? (
                  <span className="text-green-600 font-medium">✅ Read</span>
                ) : (
                  <button
                    onClick={() => handleMarkRead(a._id)}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Mark Read
                  </button>
                )}

                {isSnoozed ? (
                  <span className="text-yellow-600 font-medium">⏰ Snoozed</span>
                ) : (
                  <button
                    onClick={() => handleSnooze(a._id)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                  >
                    Snooze Today
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {alerts.length === 0 && (
        <p className="mt-6 text-gray-500 text-center">No active alerts</p>
      )}
    </div>
  );
}
