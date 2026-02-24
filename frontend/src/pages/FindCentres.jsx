import React, { useState } from 'react';

const FindCentres = () => {
  const [repairCenters] = useState([
    {
      id: 1,
      name: 'Downtown Repair Hub',
      miles: 0.8,
      address: '123 Tech Avenue, Silicon Valley, CA 94025',
      phone: '(555) 123-4567',
      hours: '9:00 AM - 7:00 PM',
      rating: 4.8
    },
    {
      id: 2,
      name: 'Downtown Repair Hub',
      miles: 0.8,
      address: '123 Tech Avenue, Silicon Valley, CA 94025',
      phone: '(555) 123-4567',
      hours: '9:00 AM - 7:00 PM',
      rating: 4.8
    },
    {
      id: 3,
      name: 'Downtown Repair Hub',
      miles: 0.8,
      address: '123 Tech Avenue, Silicon Valley, CA 94025',
      phone: '(555) 123-4567',
      hours: '9:00 AM - 7:00 PM',
      rating: 4.8
    }
  ]);

  const [activeTab, setActiveTab] = useState('MAP');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Find a Repair Center</h1>
          <p className="text-xl text-gray-100">Visit any of our authorized service centers for on-the-spot diagnostics.</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* Left Side - Centers List */}
          <div className="lg:col-span-1 space-y-4">
            {repairCenters.map((center) => (
              <div key={center.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{center.name}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <i className="fas fa-location-dot text-primary"></i>
                  <p className="text-sm font-semibold text-primary">{center.miles} miles away</p>
                </div>
                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  <div className="flex gap-2">
                    <i className="fas fa-map-pin text-primary"></i>
                    <p>{center.address}</p>
                  </div>
                  <div className="flex gap-2">
                    <i className="fas fa-phone text-primary"></i>
                    <p>{center.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    <i className="fas fa-clock text-primary"></i>
                    <p>{center.hours}</p>
                  </div>
                </div>
                <button className="w-full py-2 bg-primary text-white rounded-lg font-semibold hover:bg-secondary transition-all">
                  <i className="fas fa-door-open mr-2"></i>Open
                </button>
              </div>
            ))}
          </div>

          {/* Right Side - Map */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
            {/* Map Header */}
            <div className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-4 flex justify-between items-center">
              <button className="text-xl hover:opacity-80 transition-opacity">
                <i className="fas fa-bars"></i>
              </button>
              <h3 className="text-lg font-semibold">REPORT ISSUE</h3>
              <button className="text-xl hover:opacity-80 transition-opacity">
                <i className="fas fa-bell"></i>
              </button>
            </div>

            {/* Map Controls */}
            <div className="flex items-center gap-4 p-4 border-b border-gray-200 flex-wrap">
              <button 
                onClick={() => setActiveTab('MAP')}
                className={`px-4 py-2 font-semibold rounded-lg transition-all ${
                  activeTab === 'MAP' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <i className="fas fa-map mr-2"></i>MAP
              </button>
              <button 
                onClick={() => setActiveTab('LIVE')}
                className={`px-4 py-2 font-semibold rounded-lg transition-all ${
                  activeTab === 'LIVE' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <i className="fas fa-circle-dot mr-2"></i>LIVE
              </button>
              <button 
                onClick={() => setActiveTab('LIST')}
                className={`px-4 py-2 font-semibold rounded-lg transition-all ${
                  activeTab === 'LIST' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <i className="fas fa-list mr-2"></i>LIST
              </button>
              <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-accent text-black rounded-lg font-semibold">
                <i className="fas fa-circle text-sm"></i>
                RADIUS 500m
              </div>
            </div>

            {/* Map Content */}
            <div className="p-6 min-h-96 flex flex-col items-center justify-center">
              <svg viewBox="0 0 400 400" className="w-full max-w-md">
                <defs>
                  <radialGradient id="grad1" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" style={{stopColor: '#5a3a7a', stopOpacity: 0.8}} />
                    <stop offset="100%" style={{stopColor: '#2a1a4a', stopOpacity: 0.8}} />
                  </radialGradient>
                </defs>
                <rect width="400" height="400" fill="url(#grad1)" />
                
                {/* Map markers */}
                <circle cx="100" cy="150" r="8" fill="#ff6b6b" />
                <circle cx="200" cy="100" r="8" fill="#ffd60a" />
                <circle cx="280" cy="200" r="8" fill="#4ecdc4" />
                <circle cx="150" cy="280" r="8" fill="#ff6b6b" />
                <circle cx="300" cy="150" r="8" fill="#95e1d3" />
                <circle cx="200" cy="250" r="8" fill="#ff6b6b" />
                
                {/* Focus marker */}
                <circle cx="150" cy="200" r="12" fill="none" stroke="#ffd60a" strokeWidth="2" />
                <circle cx="150" cy="200" r="4" fill="#ffd60a" />
                
                {/* Central radius circle */}
                <circle cx="150" cy="200" r="60" fill="none" stroke="#ff6b6b" strokeWidth="2" opacity="0.5" />
                <circle cx="150" cy="200" r="70" fill="none" stroke="#ff6b6b" strokeWidth="1" opacity="0.3" />
              </svg>
              <div className="mt-6 text-center">
                <p className="text-gray-700 font-semibold">31, Wild St. There are 2 issues reported around you (100m)</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FindCentres;
