import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SmoothScroll } from './components/SmoothScroll';
import LandingPage from './pages/LandingPage';
import FeaturesPage from './pages/FeaturesPage';
import ArchitecturePage from './pages/ArchitecturePage';
import DemoPage from './pages/DemoPage';
import AppPage from './pages/AppPage';
import TestsPage from './pages/TestsPage';
import DashboardLayout from './components/DashboardLayout';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Marketing pages — with smooth scroll */}
        <Route path="/" element={<SmoothScroll><LandingPage /></SmoothScroll>} />
        <Route path="/features" element={<SmoothScroll><FeaturesPage /></SmoothScroll>} />
        <Route path="/architecture" element={<SmoothScroll><ArchitecturePage /></SmoothScroll>} />
        <Route path="/demo" element={<SmoothScroll><DemoPage /></SmoothScroll>} />

        {/* Dashboard pages — NO smooth scroll, native overflow */}
        <Route path="/app" element={<DashboardLayout><AppPage /></DashboardLayout>} />
        <Route path="/tests" element={<DashboardLayout><TestsPage /></DashboardLayout>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
