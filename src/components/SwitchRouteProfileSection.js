// src/components/SwitchRouteProfileSection.js
import { useState } from 'react';
import axios from 'axios';

export default function SwitchRouteProfileSection({ agent, apiKey }) {
  const [showForm, setShowForm] = useState(false);
  const [currentProfile, setCurrentProfile] = useState('');
  const [availableProfiles, setAvailableProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const instanceId = process.env.REACT_APP_CONNECT_INSTANCE_ID;
  const apiBase = process.env.REACT_APP_DISPURL;

  const fetchRoutingProfiles = async () => {
    try {
      const userId = agent?.getUsername();
      const res = await axios.post(
        `${apiBase}/getAvailableRoutingProfiles`,
        { userId, instanceId },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
          }
        }
      );
      setCurrentProfile(res.data.currentProfile);
      setAvailableProfiles(res.data.allowedProfiles);
    } catch (err) {
      console.error('Error fetching route profiles:', err);
      setMessage('Failed to load profiles');
    }
  };

  const handleSwitch = async () => {
    if (!selectedProfileId) return;
    setLoading(true);
    setMessage('');

    try {
      await axios.post(
        `${apiBase}/switchRoutingProfile`,
        {
          userId: agent?.getUsername(),
          instanceId,
          routingProfileId: selectedProfileId
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
          }
        }
      );
      setMessage('✅ Routing profile switched successfully!');
    } catch (err) {
      console.error('Switch failed:', err);
      setMessage('❌ Failed to switch routing profile');
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    if (!showForm) {
      fetchRoutingProfiles();
    }
    setShowForm(!showForm);
  };

  return (
    <div style={{ marginTop: '1rem', borderTop: '1px solid #ccc', paddingTop: '1rem' }}>
      <button onClick={toggleForm}>
        {showForm ? 'Cancel' : 'Switch Routing Profile'}
      </button>

      {showForm && (
        <div style={{ marginTop: '1rem' }}>
          <p><strong>Current Profile:</strong> {currentProfile || 'Loading...'}</p>

          <select
            value={selectedProfileId}
            onChange={(e) => setSelectedProfileId(e.target.value)}
            style={{ padding: '6px', width: '100%', marginBottom: '1rem' }}
          >
            <option value="">-- Select Routing Profile --</option>
            {availableProfiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleSwitch}
            disabled={!selectedProfileId || loading}
            style={{ padding: '8px 12px' }}
          >
            {loading ? 'Changing...' : 'Change'}
          </button>

          {message && <p style={{ marginTop: '10px' }}>{message}</p>}
        </div>
      )}
    </div>
  );
}
