import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function ViewAlertsPage() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [filters, setFilters] = useState({
    severity: '',
    status: '',
    audience: '',
    readStatus: '',   // 'read', 'unread', ''
    snoozeStatus: ''  // 'snoozed', 'unsnoozed', ''
  });
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetchAlerts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [alerts, filters]);

  const fetchAlerts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/alerts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts(Array.isArray(res.data) ? res.data : res.data.alerts || []);
    } catch (err) {
      console.error(err);
    }
  };

  const applyFilters = () => {
    let filtered = [...alerts];

    // Severity filter
    if (filters.severity) {
      filtered = filtered.filter(a => a.severity === filters.severity);
    }

    // Status filter
    if (filters.status) {
      const now = new Date();
      if (filters.status === 'active') {
        filtered = filtered.filter(
          a => a.active && (!a.expiryTime || new Date(a.expiryTime) > now)
        );
      } else if (filters.status === 'expired') {
        filtered = filtered.filter(
          a => a.expiryTime && new Date(a.expiryTime) < now
        );
      }
    }

    // Audience filter
    if (filters.audience) {
      if (filters.audience === 'organization') {
        filtered = filtered.filter(a => a.visibility?.organization);
      } else if (filters.audience === 'team') {
        filtered = filtered.filter(a => a.visibility?.teams?.length > 0);
      } else if (filters.audience === 'single') {
        filtered = filtered.filter(a => a.visibility?.users?.length === 1);
      }
    }

    // Read filter
    if (filters.readStatus) {
      filtered = filtered.filter(a => {
        const isRead = a.readBy?.some(r => r.toString() === userId);
        return filters.readStatus === 'read' ? isRead : !isRead;
      });
    }

    // Snooze filter
    if (filters.snoozeStatus) {
      filtered = filtered.filter(a => {
        const isSnoozed = a.snoozedUsers?.some(s => s.user.toString() === userId);
        return filters.snoozeStatus === 'snoozed' ? isSnoozed : !isSnoozed;
      });
    }

    setFilteredAlerts(filtered);
  };

  const formatDate = date => (date ? new Date(date).toLocaleString() : 'N/A');

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">View Alerts</h1>
        <button
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
          onClick={() => navigate('/admin')}
        >
          &larr; Back to Dashboard
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 sticky top-0 bg-white z-10 p-4 shadow-md rounded">
        <select
          value={filters.severity}
          onChange={e => setFilters({ ...filters, severity: e.target.value })}
          className="border p-2 rounded w-40"
        >
          <option value="">All Severities</option>
          <option>Info</option>
          <option>Warning</option>
          <option>Critical</option>
        </select>

        <select
          value={filters.status}
          onChange={e => setFilters({ ...filters, status: e.target.value })}
          className="border p-2 rounded w-40"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
        </select>

        <select
          value={filters.audience}
          onChange={e => setFilters({ ...filters, audience: e.target.value })}
          className="border p-2 rounded w-40"
        >
          <option value="">All Audience</option>
          <option value="organization">Organization</option>
          <option value="team">Team</option>
          <option value="single">Single User</option>
        </select>

        <select
          value={filters.readStatus}
          onChange={e => setFilters({ ...filters, readStatus: e.target.value })}
          className="border p-2 rounded w-40"
        >
          <option value="">All Read Status</option>
          <option value="read">Read</option>
          <option value="unread">Unread</option>
        </select>

        <select
          value={filters.snoozeStatus}
          onChange={e => setFilters({ ...filters, snoozeStatus: e.target.value })}
          className="border p-2 rounded w-40"
        >
          <option value="">All Snooze Status</option>
          <option value="snoozed">Snoozed</option>
          <option value="unsnoozed">Not Snoozed</option>
        </select>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAlerts.map(a => {
          const isRead = a.readBy?.some(r => r.toString() === userId);
          const isSnoozed = a.snoozedUsers?.some(s => s.user.toString() === userId);

          return (
            <div
              key={a._id}
              className="border rounded-lg p-4 bg-white shadow hover:shadow-lg transition duration-300"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-gray-800">{a.title}</h2>
                <span
                  className={`px-2 py-1 rounded text-sm font-medium ${
                    a.severity === 'Critical'
                      ? 'bg-red-200 text-red-800'
                      : a.severity === 'Warning'
                      ? 'bg-yellow-200 text-yellow-800'
                      : 'bg-blue-200 text-blue-800'
                  }`}
                >
                  {a.severity}
                </span>
              </div>

              <p className="text-gray-600 mb-2">{a.message}</p>

              <div className="text-sm text-gray-500 space-y-1">
                <p>
                  <strong>Status:</strong> {a.active ? 'Active' : 'Archived'}
                </p>
                <p>
                  <strong>Start:</strong> {formatDate(a.startTime)}
                </p>
                <p>
                  <strong>Expiry:</strong> {formatDate(a.expiryTime)}
                </p>
                <p>
                  <strong>Reminder:</strong> {a.reminderFrequency}h
                </p>
                <p>
                  <strong>Audience:</strong>{' '}
                  {a.visibility?.organization
                    ? 'Organization'
                    : a.visibility?.teams?.length > 0
                    ? 'Team'
                    : 'Single User'}
                </p>
                <p>
                  <strong>Read by you:</strong> {isRead ? '✅ Yes' : '❌ No'}
                </p>
                <p>
                  <strong>Snoozed by you:</strong> {isSnoozed ? '⏰ Yes' : '❌ No'}
                </p>
                <p>
                  <strong>Total Snoozed by:</strong> {a.snoozedUsers?.length || 0} user(s)
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAlerts.length === 0 && (
        <p className="text-gray-500 mt-6 text-center">
          No alerts found for the selected filters.
        </p>
      )}
    </div>
  );
}
