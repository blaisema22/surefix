// Dashboard Page
import React, { useEffect, useState } from 'react';

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    // Fetch user data
    console.log('Loading dashboard data...');
  }, []);

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>
      <section className="dashboard-section">
        <h2>Upcoming Appointments</h2>
        <div className="appointments-list">
          {appointments.length > 0 ? (
            appointments.map(apt => <div key={apt.id}>{apt.service}</div>)
          ) : (
            <p>No upcoming appointments</p>
          )}
        </div>
      </section>
      <section className="dashboard-section">
        <h2>My Devices</h2>
        <div className="devices-list">
          {devices.length > 0 ? (
            devices.map(device => <div key={device.id}>{device.name}</div>)
          ) : (
            <p>No devices added yet</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
