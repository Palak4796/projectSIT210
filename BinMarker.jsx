import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import customIconUrl from '../assets/customIcon.png'; // Adjust the path to your icon

// Define the custom icon
const customIcon = new L.Icon({
  iconUrl: customIconUrl,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const BinMarker = ({ bin }) => {
  return (
    <Marker position={[bin.lat, bin.lng]} icon={customIcon}>
      <Popup>
        <div>
          <h3>Bin Level</h3>
          <p>Current bin level: {bin.level.toFixed(2)} cm</p>
        </div>
      </Popup>
    </Marker>
  );
};

export default BinMarker;
