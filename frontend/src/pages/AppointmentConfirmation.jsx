// AppointmentConfirmation Page
import React from 'react';

const AppointmentConfirmation = () => {
  return (
    <div className="confirmation-page">
      <div className="confirmation-card">
        <h2>Appointment Confirmed!</h2>
        <div className="confirmation-details">
          <p><strong>Booking Reference:</strong> SFX-ABC-123456</p>
          <p><strong>Centre:</strong> Tech Repair Centre</p>
          <p><strong>Service:</strong> Screen Repair</p>
          <p><strong>Date:</strong> 2026-02-28</p>
          <p><strong>Time:</strong> 10:00 AM</p>
        </div>
        <button className="btn-download">Download Confirmation</button>
        <button className="btn-back">Back to Dashboard</button>
      </div>
    </div>
  );
};

export default AppointmentConfirmation;
