import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SmoothScroll } from './components/SmoothScroll';
import LandingPage from './pages/LandingPage';
import FeaturesPage from './pages/FeaturesPage';
import ArchitecturePage from './pages/ArchitecturePage';
import DemoPage from './pages/DemoPage';
import AppPage from './pages/AppPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <SmoothScroll>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/architecture" element={<ArchitecturePage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/app" element={<AppPage />} />
        </Routes>
      </SmoothScroll>
    </BrowserRouter>
  );
};

export default App;
