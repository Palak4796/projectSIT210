// SignInPage.js
import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore'; // Import Firestore methods
import { useNavigate } from 'react-router-dom';
import './SignInPage.css'; // Your CSS file for styling
import { db } from './firebase'; // Import the Firestore instance

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const auth = getAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous errors

    try {
      if (isSignUp) {
        // Sign Up Logic
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Store additional user data in Firestore
        await setDoc(doc(db, 'users', user.uid), { // 'users' is the collection name
          email: user.email,
          createdAt: new Date(),
          // Add other user details here if needed
        });

        alert('User created successfully!');
        navigate('/'); // Redirect to homepage after successful sign-up
      } else {
        // Sign In Logic
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/'); // Redirect to homepage after successful sign-in
      }
    } catch (err) {
      setError(err.message); // Capture and display error message
    }
  };

  return (
    <div className="signin-container">
      <h1>{isSignUp ? 'Sign Up' : 'Sign In'}</h1>
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
        <button type="submit">{isSignUp ? 'Sign Up' : 'Sign In'}</button>
        {error && <p className="error-message">{error}</p>}
      </form>
      <button onClick={() => setIsSignUp(!isSignUp)}>
        {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
      </button>
    </div>
  );
};

export default SignInPage;
