// Profile Page
import React, { useState } from 'react';

const Profile = () => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: ''
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = () => {
    // Save profile
    console.log('Profile saved:', user);
    setIsEditing(false);
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <h2>My Profile</h2>
        {isEditing ? (
          <form className="profile-form">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={user.name}
              onChange={handleChange}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={user.email}
              onChange={handleChange}
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone"
              value={user.phone}
              onChange={handleChange}
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={user.address}
              onChange={handleChange}
            />
            <input
              type="text"
              name="city"
              placeholder="City"
              value={user.city}
              onChange={handleChange}
            />
            <button type="button" onClick={handleSave} className="btn-save">Save</button>
            <button type="button" onClick={() => setIsEditing(false)} className="btn-cancel">Cancel</button>
          </form>
        ) : (
          <div className="profile-view">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone:</strong> {user.phone}</p>
            <p><strong>Address:</strong> {user.address}</p>
            <p><strong>City:</strong> {user.city}</p>
            <button onClick={() => setIsEditing(true)} className="btn-edit">Edit Profile</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
