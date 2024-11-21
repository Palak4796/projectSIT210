// CollectorPage.js
import React from 'react';
import BinMap from './BinMap'; // Ensure the correct path

const CollectorPage = () => {
  return (
    <div>
      <h1>Bin Locations</h1>
      <BinMap /> {/* Render the map with bin locations */}
    </div>
  );
};

export default CollectorPage;
