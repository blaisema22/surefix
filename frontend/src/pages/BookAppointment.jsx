// BookAppointment Page
import React, { useState } from 'react';

const BookAppointment = () => {
  const [formData, setFormData] = useState({
    device: '',
    deviceType: '',
    issue: '',
    service: '',
    date: '',
    time: '',
    centre: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const deviceTypes = ['Smartphone', 'Laptop', 'Tablet', 'Desktop', 'Other'];
  const issues = [
    'Screen Damage',
    'Battery Not Charging',
    'Water Damage',
    'Software Issues',
    'Hardware Malfunction',
    'Other'
  ];
  const services = [
    'Screen Replacement',
    'Battery Replacement',
    'Water Damage Repair',
    'Software Support',
    'General Maintenance',
    'Diagnostic'
  ];
  const centres = [
    'Downtown Repair Hub',
    'Tech Center Plaza',
    'Express Repair Station',
    'Professional Service Center'
  ];
  const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      console.log('Booking appointment:', formData);
      setSubmitted(true);
      setTimeout(() => {
        setStep(1);
        setFormData({
          device: '',
          deviceType: '',
          issue: '',
          service: '',
          date: '',
          time: '',
          centre: '',
          firstName: '',
          lastName: '',
          email: '',
          phone: ''
        });
        setSubmitted(false);
      }, 3000);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="book-appointment-page">
      {/* Header Section */}
      <section className="book-appointment-header">
        <h1>Book a Repair</h1>
        <p>Schedule your device repair with our certified technicians</p>
      </section>

      {/* Form Container */}
      <section className="book-appointment-container">
        {submitted ? (
          <div className="success-message">
            <div className="success-icon"><i className="fas fa-check-circle"></i></div>
            <h2>Booking Confirmed!</h2>
            <p>Your repair appointment has been scheduled successfully.</p>
            <p className="booking-ref">Booking Reference: REP-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
          </div>
        ) : (
          <div className="book-form-wrapper">
            {/* Progress Indicator */}
            <div className="progress-bar">
              <div className="progress-steps">
                <div className={`step ${step >= 1 ? 'active' : ''}`}>
                  <span>1</span>
                  <p>Device Info</p>
                </div>
                <div className="progress-line" style={{width: step >= 2 ? '100%' : '0%'}}></div>
                <div className={`step ${step >= 2 ? 'active' : ''}`}>
                  <span>2</span>
                  <p>Service & Schedule</p>
                </div>
                <div className="progress-line" style={{width: step >= 3 ? '100%' : '0%'}}></div>
                <div className={`step ${step >= 3 ? 'active' : ''}`}>
                  <span>3</span>
                  <p>Contact Info</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="book-form">
              {/* Step 1: Device Information */}
              {step === 1 && (
                <div className="form-step">
                  <h2>Device Information</h2>
                  <div className="form-group">
                    <label>Device Name*</label>
                    <input
                      type="text"
                      name="device"
                      placeholder="e.g., iPhone 12"
                      value={formData.device}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Device Type*</label>
                    <select name="deviceType" value={formData.deviceType} onChange={handleChange} required>
                      <option value="">Select device type</option>
                      {deviceTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Issue Description*</label>
                    <select name="issue" value={formData.issue} onChange={handleChange} required>
                      <option value="">Select the main issue</option>
                      {issues.map(issue => (
                        <option key={issue} value={issue}>{issue}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Step 2: Service & Schedule */}
              {step === 2 && (
                <div className="form-step">
                  <h2>Service & Schedule</h2>
                  <div className="form-group">
                    <label>Service Type*</label>
                    <select name="service" value={formData.service} onChange={handleChange} required>
                      <option value="">Select service</option>
                      {services.map(service => (
                        <option key={service} value={service}>{service}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Preferred Date*</label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        min={getTodayDate()}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Time Slot*</label>
                      <select name="time" value={formData.time} onChange={handleChange} required>
                        <option value="">Select time</option>
                        {timeSlots.map(slot => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Repair Centre*</label>
                    <select name="centre" value={formData.centre} onChange={handleChange} required>
                      <option value="">Select centre</option>
                      {centres.map(centre => (
                        <option key={centre} value={centre}>{centre}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Step 3: Contact Information */}
              {step === 3 && (
                <div className="form-step">
                  <h2>Contact Information</h2>
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name*</label>
                      <input
                        type="text"
                        name="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name*</label>
                      <input
                        type="text"
                        name="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Email Address*</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number*</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="(555) 123-4567"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="form-buttons">
                {step > 1 && (
                  <button type="button" className="btn-back" onClick={handleBack}>
                    Back
                  </button>
                )}
                <button type="submit" className="btn-next">
                  {step < 3 ? 'Next' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        )}
      </section>
    </div>
  );
};

export default BookAppointment;
