import React from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import Header from './Header';
import Footer from './Footer';

const RootDiv = styled('div')({
  display: 'flex',
  minHeight: '100vh',
  flexDirection: 'column',
  flexGrow: 1,
});

export default function Layout() {
  return (
    <RootDiv>
      <Header />
      <main>
        <Outlet />
      </main>
      {/* <Footer/> */}
    </RootDiv>
  );
}
