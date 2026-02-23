// FindCentres Page
import React, { useEffect, useState } from 'react';
import CentreCard from '../components/CentreCard.jsx';

const FindCentres = () => {
  const [centres, setCentres] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch centres
    console.log('Loading centres...');
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="find-centres-page">
      <h1>Find Repair Centres</h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search centres..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
      <div className="centres-grid">
        {centres.map(centre => (
          <CentreCard key={centre.id} centre={centre} />
        ))}
      </div>
    </div>
  );
};

export default FindCentres;
