// BookAppointment Page
import React, { useState } from 'react';

const BookAppointment = () => {
  const [formData, setFormData] = useState({
    device: '',
    service: '',
    date: '',
    time: '',
    centre: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Book appointment
    console.log('Booking appointment:', formData);
  };

  return (
    <div className="book-appointment-page">
      <form onSubmit={handleSubmit} className="book-form">
        <h2>Book an Appointment</h2>
        <select name="device" value={formData.device} onChange={handleChange} required>
          <option value="">Select Device</option>
          <option value="device1">Device 1</option>
          <option value="device2">Device 2</option>
        </select>
        <select name="service" value={formData.service} onChange={handleChange} required>
          <option value="">Select Service</option>
          <option value="screen">Screen Repair</option>
          <option value="battery">Battery Replacement</option>
        </select>
        <input type="date" name="date" value={formData.date} onChange={handleChange} required />
        <input type="time" name="time" value={formData.time} onChange={handleChange} required />
        <select name="centre" value={formData.centre} onChange={handleChange} required>
          <option value="">Select Centre</option>
          <option value="centre1">Centre 1</option>
        </select>
        <button type="submit" className="btn-submit">Book Now</button>
      </form>
    </div>
  );
};

export default BookAppointment;
