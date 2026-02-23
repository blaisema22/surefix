// MyDevices Page
import React, { useEffect, useState } from 'react';
import DeviceCard from '../components/DeviceCard.jsx';

const MyDevices = () => {
  const [devices, setDevices] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    // Fetch devices
    console.log('Loading devices...');
  }, []);

  const handleAddDevice = (deviceData) => {
    // Add device
    console.log('Device added:', deviceData);
  };

  return (
    <div className="my-devices-page">
      <h1>My Devices</h1>
      <button onClick={() => setShowForm(!showForm)} className="btn-add">Add Device</button>
      <div className="devices-grid">
        {devices.map(device => (
          <DeviceCard key={device.id} device={device} />
        ))}
      </div>
    </div>
  );
};

export default MyDevices;
