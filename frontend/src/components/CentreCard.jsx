// CentreCard Component
import React from 'react';

const CentreCard = ({ centre }) => {
  return (
    <div className="centre-card">
      <h3>{centre.name}</h3>
      <p><strong>Address:</strong> {centre.address}</p>
      <p><strong>Phone:</strong> {centre.phoneNumber}</p>
      <p><strong>Rating:</strong> {centre.rating} ⭐</p>
      <button className="btn-book">Book Appointment</button>
      <button className="btn-view-reviews">View Reviews</button>
    </div>
  );
};

export default CentreCard;
