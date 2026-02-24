// AppointmentCard Component
import React from 'react';

const AppointmentCard = ({ appointment }) => {
  return (
    <div className="appointment-card">
      <h3>{appointment.centre}</h3>
      <p><strong>Service:</strong> {appointment.service}</p>
      <p><strong>Date:</strong> {appointment.date}</p>
      <p><strong>Time:</strong> {appointment.time}</p>
      <p><strong>Status:</strong> <span className={`status ${appointment.status}`}>{appointment.status}</span></p>
      <button className="btn-view">View Details</button>
    </div>
  );
};

export default AppointmentCard;
