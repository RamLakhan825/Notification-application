import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function CreateAlertPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    title: '',
    message: '',
    severity: 'Info',
    deliveryType: 'In-App',
    reminderFrequency: 2,
    visibility: { organization: false, teams: [], users: [] },
    expiryTime: ''
  });
  const [visibilityType, setVisibilityType] = useState('organization');
  const [selectedTeamUsers, setSelectedTeamUsers] = useState([]);
  const [selectedSingleUser, setSelectedSingleUser] = useState('');
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);

    let visibility = { organization: false, teams: [], users: [] };
    if (visibilityType === 'organization') {
      visibility.organization = true;
      visibility.users = users.map(u => u._id);
    } else if (visibilityType === 'team') {
      visibility.users = selectedTeamUsers.map(u => u._id);
    } else if (visibilityType === 'single') {
      if (selectedSingleUser) visibility.users = [selectedSingleUser];
    }

    const payload = {
      ...form,
      visibility,
      expiryTime: form.expiryTime ? new Date(form.expiryTime) : null
    };

    try {
      const res = await axios.post('http://localhost:5000/api/alerts', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('✅ Alert created successfully! Notifications will be sent to users based on delivery type.');

      // Reset form
      setForm({
        title: '',
        message: '',
        severity: 'Info',
        deliveryType: 'In-App',
        reminderFrequency: 2,
        visibility: { organization: false, teams: [], users: [] },
        expiryTime: ''
      });
      setSelectedTeamUsers([]);
      setSelectedSingleUser('');
      setVisibilityType('organization');

    } catch (err) {
      console.error(err);
      alert('❌ Error creating alert!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <div className="p-8 max-w-3xl mx-auto w-full">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">Create Alert</h1>
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-lg shadow-lg space-y-4">
          
          {/* Title & Message */}
          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            required
            className="border p-3 w-full rounded-md focus:ring-2 focus:ring-blue-400"
          />
          <textarea
            placeholder="Message"
            value={form.message}
            onChange={e => setForm({ ...form, message: e.target.value })}
            required
            className="border p-3 w-full rounded-md focus:ring-2 focus:ring-blue-400"
          />

          {/* Severity & Delivery Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={form.severity}
              onChange={e => setForm({ ...form, severity: e.target.value })}
              className="border p-3 rounded-md focus:ring-2 focus:ring-blue-400"
            >
              <option>Info</option>
              <option>Warning</option>
              <option>Critical</option>
            </select>
            <select
              value={form.deliveryType}
              onChange={e => setForm({ ...form, deliveryType: e.target.value })}
              className="border p-3 rounded-md focus:ring-2 focus:ring-blue-400"
            >
              <option>In-App</option>
              <option>Email</option>
              <option>SMS</option>
            </select>
          </div>

          {/* Reminder & Expiry */}
          <input
            type="number"
            placeholder="Reminder Frequency (hours)"
            value={form.reminderFrequency}
            onChange={e => setForm({ ...form, reminderFrequency: parseInt(e.target.value) })}
            className="border p-3 w-full rounded-md focus:ring-2 focus:ring-blue-400"
            min={1}
          />
          <input
            type="datetime-local"
            value={form.expiryTime}
            onChange={e => setForm({ ...form, expiryTime: e.target.value })}
            className="border p-3 w-full rounded-md focus:ring-2 focus:ring-blue-400"
          />

          {/* Visibility */}
          <select
            value={visibilityType}
            onChange={e => setVisibilityType(e.target.value)}
            className="border p-3 w-full rounded-md focus:ring-2 focus:ring-blue-400"
          >
            <option value="organization">Organization</option>
            <option value="team">Team</option>
            <option value="single">Single User</option>
          </select>

          {visibilityType === 'team' && (
            <select
              multiple
              value={selectedTeamUsers.map(u => u._id)}
              onChange={e => {
                const selected = Array.from(e.target.selectedOptions).map(opt =>
                  users.find(u => u._id === opt.value)
                );
                setSelectedTeamUsers(selected);
              }}
              className="border p-3 w-full rounded-md focus:ring-2 focus:ring-blue-400"
            >
              {users.map(u => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          )}

          {visibilityType === 'single' && (
            <select
              value={selectedSingleUser}
              onChange={e => setSelectedSingleUser(e.target.value)}
              className="border p-3 w-full rounded-md focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select User</option>
              {users.map(u => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          )}

          {/* Buttons */}
          <div className="flex gap-4 mt-4">
            <button
              type="submit"
              className={`bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg font-semibold hover:bg-blue-600 transition duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Alert'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg shadow-lg font-semibold hover:bg-gray-600 transition duration-300"
            >
              Back
            </button>
          </div>
        </form>
      </div>

      <footer className="bg-gray-200 p-4 text-center text-gray-700 text-sm">
        &copy; {new Date().getFullYear()} MyAlertSystem. All rights reserved.
      </footer>
    </div>
  );
}
