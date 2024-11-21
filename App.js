// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import SignInPage from './components/SignInPage';
import CollectorSignInpage from './components/CollectorSignInpage'; // Ensure correct name
import CollectorPage from './components/CollectorPage';
import BinData from './components/BinData'; 
import BinMap from './components/BinMap'; 

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/collector-signin" element={<CollectorSignInpage />} />
        <Route path="/collector" element={<CollectorPage />} />
        <Route path="/bindata" element={<BinData />} />
        <Route path="/binmap" element={<BinMap />} />
        <Route path="*" element={<h2>404: Page Not Found</h2>} /> {/* Catch-all route */}
      </Routes>
    </Router>
  );
};

export default App;
