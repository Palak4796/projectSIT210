import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { db } from '../firebase'; // Ensure Firestore db is initialized in firebase.js
import { doc, setDoc } from 'firebase/firestore';
import './CollectorSignInpage.css'; // Import the CSS file

const CollectorSignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Reset error message

    if (isSigningUp) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Add collector's info to Firestore
        await setDoc(doc(db, 'collectors', user.uid), {
          email: user.email,
          createdAt: new Date(),
          role: 'collector'
        });

        alert('Collector signed up successfully!');
        navigate('/collector');
      } catch (error) {
        setError(error.message);
      }
    } else {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        navigate('/collector');
      } catch (error) {
        setError(error.message);
      }
    }
  };

  return (
    <div className="signin-container">
      <h1>{isSigningUp ? 'Collector Sign Up' : 'Collector Sign In'}</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <div className="error-message">{error}</div>}
        <button type="submit">{isSigningUp ? 'Sign Up' : 'Sign In'}</button>
      </form>
      <p>
        {isSigningUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <span
          onClick={() => setIsSigningUp(!isSigningUp)}
          style={{ cursor: 'pointer', color: '#007bff' }}
        >
          {isSigningUp ? 'Sign In' : 'Sign Up'}
        </span>
      </p>
    </div>
  );
};

export default CollectorSignInPage;
