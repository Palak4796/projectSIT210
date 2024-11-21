import React, { useEffect, useState, useRef } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import './BinMap.css';
import { db } from '../firebase'; // Adjust path as needed
import customIconUrl from '../assets/customIcon.png'; // Adjust path as needed
import esp32IconUrl from '../assets/customIcon1.png'; // Adjust path as needed
import 'leaflet-routing-machine';
import 'leaflet.markercluster';

const nanoIcon = new L.Icon({
  iconUrl: customIconUrl,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const esp32Icon = new L.Icon({
  iconUrl: esp32IconUrl,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const staticBins = [
  { id: 0, level: 2, lat: -37.8000, lng: 144.9525 },
  { id: 1, level: 5, lat: -37.7990, lng: 144.9536 },
  { id: 2, level: 3, lat: -37.7980, lng: 144.9536 },
];

// Helper function to calculate distance
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const pointA = new L.LatLng(lat1, lng1);
  const pointB = new L.LatLng(lat2, lng2);
  return pointA.distanceTo(pointB);
};

const BinMap = () => {
  const [nanoBins, setNanoBins] = useState([]);
  const [esp32Bins, setEsp32Bins] = useState([]);
  const [shortestPath, setShortestPath] = useState([]);
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchData = () => {
      const nanoQuery = query(collection(db, 'BinNanoMessages'), orderBy('timestamp', 'desc'), limit(50));
      const unsubscribeNano = onSnapshot(nanoQuery, (snapshot) => {
        const messages = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data?.distance) {
            const levelMatch = data.distance.match(/Distance: ([\d.]+) cm/);
            if (levelMatch) {
              const level = parseFloat(levelMatch[1]);
              const lat = data.location?.lat ?? -37.8000;
              const lng = data.location?.lng ?? 144.9500;
              const timestamp = data.timestamp?.toDate();
              if (!isNaN(level) && timestamp) {
                messages.push({ level, lat, lng, timestamp });
              }
            }
          }
        });
        setNanoBins(messages.sort((a, b) => b.timestamp - a.timestamp).slice(0, 1));
      });

      const esp32Query = query(collection(db, 'BinESP32Messages'), orderBy('timestamp', 'desc'), limit(50));
      const unsubscribeEsp32 = onSnapshot(esp32Query, (snapshot) => {
        const messages = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data?.distance) {
            const levelMatch = data.distance.match(/Distance: ([\d.]+) cm/);
            if (levelMatch) {
              const level = parseFloat(levelMatch[1]);
              let lat = data.location?.lat ?? -37.8000;
              let lng = data.location?.lng ?? 144.9500;
              lat += 0.0028;
              lng += 0.0015;
              if (!isNaN(level)) {
                messages.push({ level, lat, lng });
              }
            }
          }
        });
        setEsp32Bins(messages.sort((a, b) => b.timestamp - a.timestamp).slice(0, 1));
      });

      return () => {
        unsubscribeNano();
        unsubscribeEsp32();
      };
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Combine all bins, including nano, esp32, and static bins
    const bins = [
      ...nanoBins.map((bin, index) => ({ ...bin, id: `nano-${index}` })),
      ...esp32Bins.map((bin, index) => ({ ...bin, id: `esp32-${index}` })),
      ...staticBins.map((bin) => ({ ...bin, id: `static-${bin.id}` })),
    ];
  
    // Filter bins where the level is <= 5
    const eligibleNanoBins = nanoBins.filter(bin => bin.level <= 5);
    const eligibleEsp32Bins = esp32Bins.filter(bin => bin.level <= 5);
  
    // Determine the starting bin by checking for eligible bins
    const startBin = eligibleNanoBins[0] || eligibleEsp32Bins[0] || staticBins[0];
  
    // Define binsToVisit: combining the eligible bins and static bins
    const binsToVisit = [
      ...eligibleNanoBins,
      ...eligibleEsp32Bins,
      ...staticBins,  // Include static bins as fallback or alternative
    ];
  
    // Create an array of bin coordinates for routing (only bins to be visited)
    const binCoordinates = binsToVisit.map(bin => [bin.lat, bin.lng]);
  
    // Wait for map to be ready to use Leaflet Routing Machine
    if (mapRef.current && binCoordinates.length > 1) {
      const routeControl = L.Routing.control({
        waypoints: binCoordinates.map(coord => L.latLng(coord)),
        routeWhileDragging: true,
        // Start route from the selected startBin
        waypoints: [L.latLng(startBin.lat, startBin.lng), ...binCoordinates.map(coord => L.latLng(coord))],
      }).addTo(mapRef.current);
    }
  }, [nanoBins, esp32Bins]);
  

  return (
    <MapContainer center={[-37.8000, 144.9525]} zoom={14} style={{ height: '100vh' }} ref={mapRef}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {nanoBins.map((bin, index) => (
        <Marker key={index} position={[bin.lat, bin.lng]} icon={nanoIcon}>
          <Popup>
            <h3>Bin {index + 1}</h3>
            <p>Level: {bin.level} %left</p>
          </Popup>
        </Marker>
      ))}
      {esp32Bins.map((bin, index) => (
        <Marker key={index} position={[bin.lat, bin.lng]} icon={esp32Icon}>
          <Popup>
            <h3>ESP32 Bin {index + 1}</h3>
            <p>Level: {bin.level} %left</p>
          </Popup>
        </Marker>
      ))}
      {/* Static bins using the same icon as nano bins */}
      {staticBins.map((bin) => (
        <Marker key={bin.id} position={[bin.lat, bin.lng]} icon={nanoIcon}>
          <Popup>
            <h3>Static Bin {bin.id}</h3>
            <p>Level: {bin.level} %left</p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default BinMap;
