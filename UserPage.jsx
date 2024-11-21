// UserPage.js
import React from 'react';
import { getAuth } from 'firebase/auth';

const UserPage = () => {
  const auth = getAuth();
  const user = auth.currentUser;

  return (
    <div>
      <h1>Welcome, {user ? user.displayName : 'User'}</h1>
      <p>Email: {user ? user.email : 'Not logged in'}</p>
      {/* Add more user-related content here */}
    </div>
  );
};

export default UserPage;
