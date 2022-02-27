import React from 'react';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout';
import Competition from './pages/Competition';
import history from './lib/history';
import AuthProvider from './providers/AuthProvider'

const App = () => (
  <BrowserRouter history={history}>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/Competition" element={<Competition />} />
        </Route>
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export default App;