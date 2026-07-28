import React, { type PropsWithChildren } from 'react';
import { Box, Container } from '@mui/material';
import { Header, type HeaderProps } from './Header';

export type MainLayoutProps = PropsWithChildren<HeaderProps>;

export const MainLayout: React.FC<MainLayoutProps> = ({ children, onJoinContract, onDeployContract }) => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#030304' }}>
      <Header onJoinContract={onJoinContract} onDeployContract={onDeployContract} />
      <Container maxWidth="sm" sx={{ pt: 2, pb: 8 }}>
        {children}
      </Container>
    </Box>
  );
};
