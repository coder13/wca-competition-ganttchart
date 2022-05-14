import React from 'react';

import { Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout';
import Competition from './pages/Competition';
import CompetitionHome from './pages/Competition/Home';
import Home from './pages/Home';
import AuthProvider from './providers/AuthProvider';
import QueryParamPreservingRouter from './components/QueryParamPreservingRouter';

const App = () => (
  <QueryParamPreservingRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/competitions/:competitionId" element={<Competition />}>
            <Route index element={<CompetitionHome />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  </QueryParamPreservingRouter>
);

export default App;