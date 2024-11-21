import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import './BinData.css';

const BinData = () => {
  const [latestDistanceNano, setLatestDistanceNano] = useState(null);
  const [latestDistanceESP32, setLatestDistanceESP32] = useState(null);
  const maxBinHeight = 100; // Maximum height of bin in cm

  useEffect(() => {
    
    const fetchNanoData = query(
      collection(db, "BinNanoMessages"),
      orderBy("timestamp", "desc"),
      limit(1)
    );

    const unsubscribeNano = onSnapshot(fetchNanoData, (snapshot) => {
      if (!snapshot.empty) {
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data && typeof data.distance === 'string') {
            const levelMatch = data.distance.match(/Distance: ([\d.]+) cm/);
            if (levelMatch) {
              const level = parseFloat(levelMatch[1]);
              setLatestDistanceNano(level);
            }
          }
        });
      }
    });

    const fetchESP32Data = query(
      collection(db, "BinESP32Messages"),
      orderBy("timestamp", "desc"),
      limit(1)
    );

    const unsubscribeESP32 = onSnapshot(fetchESP32Data, (snapshot) => {
      if (!snapshot.empty) {
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data && typeof data.distance === 'string') {
            const levelMatch = data.distance.match(/Distance: ([\d.]+) cm/);
            if (levelMatch) {
              const level = parseFloat(levelMatch[1]);
              setLatestDistanceESP32(level);
            }
          }
        });
      }
    });

    return () => {
      unsubscribeNano();
      unsubscribeESP32();
    };
  }, []);

  const fullnessPercentageNano = Math.min(
    latestDistanceNano !== null
      ? ((maxBinHeight - latestDistanceNano) / maxBinHeight) * 100
      : 0,
    100
  );
  
  const fullnessPercentageESP32 = Math.min(
    latestDistanceESP32 !== null
      ? ((maxBinHeight - latestDistanceESP32) / maxBinHeight) * 100
      : 0,
    100
  );
  

  return (
    <div className="bin-container">
      <h2>Latest Bin Fullness</h2>
      <div className="bin-group">
        <div className="bin-section">
          <h3>Bin Nano</h3>
          {latestDistanceNano !== null ? (
            <p>{fullnessPercentageNano.toFixed(2)}% full</p>
          ) : (
            <p>No data available</p>
          )}
          <div className="bin-outer">
            <div
              className="bin"
              style={{
                height: `${fullnessPercentageNano}%`,
                backgroundColor: fullnessPercentageNano > 82 ? 'red' : '#4CAF50',
              }}
            >
              <span className="label">{fullnessPercentageNano.toFixed(2)}% full</span>
            </div>
          </div>
        </div>
        <div className="bin-section">
          <h3>Bin ESP32</h3>
          {latestDistanceESP32 !== null ? (
            <p>{fullnessPercentageESP32.toFixed(2)}% full</p>
          ) : (
            <p>No data available</p>
          )}
          <div className="bin-outer">
            <div
              className="bin"
              style={{
                height: `${fullnessPercentageESP32}%`,
                backgroundColor: fullnessPercentageESP32 > 80 ? 'red' : '#4CAF50',
              }}
            >
              <span className="label">{fullnessPercentageESP32.toFixed(2)}% full</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BinData;
