import React from 'react';
import { useAuth } from '../../providers/AuthProvider';

export default function Header() {
  const { signIn, signOut, signedIn } = useAuth();
  console.log(6, signedIn());

  return (
    <header>
      {signedIn()
        ? <button onClick={signOut}>Sign Out</button>
        : <button onClick={signIn}>Sign In</button>
      }
    </header>
  );
}
