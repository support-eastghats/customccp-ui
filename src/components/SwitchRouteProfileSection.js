import { useState } from 'react';
import axios from 'axios';
import './SwitchRouteProfileSection.css';

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
      setMessage('❌ Failed to load profiles');
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
    if (!showForm) fetchRoutingProfiles();
    setShowForm(!showForm);
  };

  return (
    <div className="switch-container">
      <button className="switch-toggle" onClick={toggleForm}>
        {showForm ? 'Cancel' : 'Switch Routing Profile'}
      </button>

      {showForm && (
        <div className="switch-form">
          <p><strong>Current Profile:</strong> {currentProfile || 'Loading...'}</p>

          <select
            className="switch-dropdown"
            value={selectedProfileId}
            onChange={(e) => setSelectedProfileId(e.target.value)}
          >
            <option value="">-- Select Routing Profile --</option>
            {availableProfiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
              </option>
            ))}
          </select>

          <button
            className="switch-submit"
            onClick={handleSwitch}
            disabled={!selectedProfileId || loading}
          >
            {loading ? 'Changing...' : 'Change'}
          </button>

          {message && <p className="switch-message">{message}</p>}
        </div>
      )}
    </div>
  );
}
