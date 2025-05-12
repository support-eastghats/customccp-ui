// switchRouteProfile.js
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function SwitchRouteProfile({ agent, apiKey }) {
  const [currentProfile, setCurrentProfile] = useState('');
  const [availableProfiles, setAvailableProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [message, setMessage] = useState('');

  const instanceId = process.env.REACT_APP_CONNECT_INSTANCE_ID;
  const apiBase = process.env.REACT_APP_DISPURL;

  useEffect(() => {
    const fetchRoutingProfiles = async () => {
      try {
        const userId = agent?.getUsername();
        const res = await axios.post(
          `${apiBase}/getAvailableRoutingProfiles`,
          { userId, instanceId },
          { headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey } }
        );
        setCurrentProfile(res.data.currentProfile);
        setAvailableProfiles(res.data.allowedProfiles);
      } catch (err) {
        console.error('Error fetching route profiles:', err);
        setMessage('Failed to load profiles');
      }
    };

    if (agent) fetchRoutingProfiles();
  }, [agent]);

  const handleSwitch = async () => {
    try {
      await axios.post(
        `${apiBase}/switchRoutingProfile`,
        { userId: agent?.getUsername(), instanceId, routingProfileId: selectedProfileId },
        { headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey } }
      );
      setMessage('Routing profile switched successfully!');
    } catch (err) {
      console.error('Switch failed:', err);
      setMessage('Failed to switch routing profile');
    }
  };

  return (
    <div style={{ marginTop: '1rem', border: '1px solid #ddd', padding: '1rem' }}>
      <h4>Routing Profile Management</h4>
      <p><strong>Current Profile:</strong> {currentProfile || 'Loading...'}</p>

      <select
        value={selectedProfileId}
        onChange={(e) => setSelectedProfileId(e.target.value)}
        style={{ padding: '6px', width: '100%', marginBottom: '1rem' }}
      >
        <option value="">-- Select Routing Profile --</option>
        {availableProfiles.map((profile) => (
          <option key={profile.id} value={profile.id}>{profile.name}</option>
        ))}
      </select>

      <button
        onClick={handleSwitch}
        disabled={!selectedProfileId}
        style={{ padding: '8px 12px' }}
      >
        Switch Profile
      </button>

      {message && <p style={{ marginTop: '8px' }}>{message}</p>}
    </div>
  );
}