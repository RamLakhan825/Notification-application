import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ManageAlertsPage() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [editingAlertId, setEditingAlertId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await axios.get('https://notification-application.onrender.com/api/alerts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleArchive = async (id) => {
    try {
      await axios.delete(`https://notification-application.onrender.com/api/alerts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (alert) => {
    setEditingAlertId(alert._id);
    setEditForm({
      title: alert.title,
      message: alert.message,
      severity: alert.severity,
      deliveryType: alert.deliveryType,
      reminderFrequency: alert.reminderFrequency,
      startTime: alert.startTime ? new Date(alert.startTime).toISOString().slice(0,16) : '',
      expiryTime: alert.expiryTime ? new Date(alert.expiryTime).toISOString().slice(0,16) : '',
      active: alert.active
    });
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(
        `https://notification-application.onrender.com/api/alerts/${id}`,
        {
          ...editForm,
          startTime: editForm.startTime ? new Date(editForm.startTime) : null,
          expiryTime: editForm.expiryTime ? new Date(editForm.expiryTime) : null
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setEditingAlertId(null);
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Manage Alerts</h1>
      <button
        className="bg-gray-500 text-white px-4 py-2 rounded mb-4"
        onClick={() => navigate('/admin')}
      >
        Back
      </button>

      <ul>
        {alerts.map(a => (
          <li
            key={a._id}
            className="mb-4 border-b pb-2 flex flex-col gap-2 bg-gray-50 p-2 rounded"
          >
            {editingAlertId === a._id ? (
              <>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                  className="border p-1 rounded w-full"
                />
                <textarea
                  value={editForm.message}
                  onChange={e => setEditForm({ ...editForm, message: e.target.value })}
                  className="border p-1 rounded w-full"
                />
                <select
                  value={editForm.severity}
                  onChange={e => setEditForm({ ...editForm, severity: e.target.value })}
                  className="border p-1 rounded w-full"
                >
                  <option>Info</option>
                  <option>Warning</option>
                  <option>Critical</option>
                </select>
                <select
                  value={editForm.deliveryType}
                  onChange={e => setEditForm({ ...editForm, deliveryType: e.target.value })}
                  className="border p-1 rounded w-full"
                >
                  <option>In-App</option>
                  <option>Email</option>
                  <option>SMS</option>
                </select>
                <input
                  type="number"
                  value={editForm.reminderFrequency}
                  onChange={e => setEditForm({ ...editForm, reminderFrequency: parseInt(e.target.value) })}
                  className="border p-1 rounded w-full"
                  min={0}
                />
                <label className="flex flex-col">
                  Start Time:
                  <input
                    type="datetime-local"
                    value={editForm.startTime}
                    onChange={e => setEditForm({ ...editForm, startTime: e.target.value })}
                    className="border p-1 rounded w-full"
                  />
                </label>
                <label className="flex flex-col">
                  Expiry Time:
                  <input
                    type="datetime-local"
                    value={editForm.expiryTime}
                    onChange={e => setEditForm({ ...editForm, expiryTime: e.target.value })}
                    className="border p-1 rounded w-full"
                  />
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editForm.active}
                    onChange={e => setEditForm({ ...editForm, active: e.target.checked })}
                  />
                  Active
                </label>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleUpdate(a._id)}
                    className="bg-green-500 text-white px-2 py-1 rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingAlertId(null)}
                    className="bg-gray-500 text-white px-2 py-1 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <div className="flex justify-between items-center">
                <div>
                  <strong>{a.title}</strong> - {a.severity} - {a.active ? 'Active' : 'Archived'}
                  <div className="text-sm">
                    Start: {a.startTime ? new Date(a.startTime).toLocaleString() : 'N/A'} | 
                    Expiry: {a.expiryTime ? new Date(a.expiryTime).toLocaleString() : 'N/A'} | 
                    Reminder: {a.reminderFrequency}h
                  </div>
                </div>
                <div className="flex gap-2">
                  {a.active && (
                    <button
                      onClick={() => handleArchive(a._id)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Archive
                    </button>
                  )}
                  <button
                    onClick={() => startEdit(a)}
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    Edit
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
