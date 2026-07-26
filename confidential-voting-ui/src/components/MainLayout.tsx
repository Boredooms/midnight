import React, { type PropsWithChildren } from 'react';
import { Box, Container } from '@mui/material';
import { Header, type HeaderProps } from './Header';

export type MainLayoutProps = PropsWithChildren<HeaderProps>;

export const MainLayout: React.FC<MainLayoutProps> = ({ children, onJoinContract, onDeployContract }) => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#08080c', color: '#fff' }}>
      <Header onJoinContract={onJoinContract} onDeployContract={onDeployContract} />
      <Container maxWidth="lg" sx={{ pt: 4, pb: 8 }}>
        {children}
      </Container>
    </Box>
  );
};
