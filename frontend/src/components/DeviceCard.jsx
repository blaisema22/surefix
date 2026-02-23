// DeviceCard Component
import React from 'react';

const DeviceCard = ({ device }) => {
  return (
    <div className="device-card">
      <h3>{device.name}</h3>
      <p><strong>Brand:</strong> {device.brand}</p>
      <p><strong>Model:</strong> {device.model}</p>
      <p><strong>Serial:</strong> {device.serialNumber}</p>
      <button className="btn-edit">Edit</button>
      <button className="btn-delete">Delete</button>
    </div>
  );
};

export default DeviceCard;
