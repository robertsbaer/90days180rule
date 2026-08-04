import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { HashRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import { 
  HomePage, 
  SchengenCalculatorPage, 
  NinetyDayRulePage, 
  SchengenVisaCalculatorPage, 
  HowManyDaysPage, 
  WhenCanIReturnPage 
} from './pages/SEOPages.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<HomePage />} />
            <Route path="schengen-calculator" element={<SchengenCalculatorPage />} />
            <Route path="90-180-rule" element={<NinetyDayRulePage />} />
            <Route path="schengen-visa-calculator" element={<SchengenVisaCalculatorPage />} />
            <Route path="how-many-days-can-i-stay-in-europe" element={<HowManyDaysPage />} />
            <Route path="when-can-i-return-to-schengen" element={<WhenCanIReturnPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </HelmetProvider>
  </StrictMode>
);
