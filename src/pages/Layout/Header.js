import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';

export default function Header() {
  const { signIn, signOut, signedIn } = useAuth();

  return (
    <header style={{
      display: 'flex',
      flex: 0,
      flexDirection: 'row',
      padding: '0.25em',
      boxShadow: '0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)',
    }}>
      {signedIn() && <Link to="/">View Competitions</Link>}
      <div style={{ display: 'flex', flex: 1 }} />
      {signedIn()
        ? <button onClick={signOut}>Sign Out</button>
        : <button onClick={signIn}>Sign In</button>
      }
    </header>
  );
}
