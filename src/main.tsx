import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import { 
  HomePage, 
  SchengenCalculatorPage, 
  NinetyDayRulePage, 
  SchengenVisaCalculatorPage, 
  HowManyDaysPage, 
  WhenCanIReturnPage,
  USACitizensPage,
  UKCitizensPage
} from './pages/SEOPages.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<HomePage />} />
            <Route path="90days180rule" element={<SchengenCalculatorPage />} />
            <Route path="90-180-rule" element={<NinetyDayRulePage />} />
            <Route path="schengen-visa-calculator" element={<SchengenVisaCalculatorPage />} />
            <Route path="how-many-days-can-i-stay-in-europe" element={<HowManyDaysPage />} />
            <Route path="when-can-i-return-to-schengen" element={<WhenCanIReturnPage />} />
            <Route path="schengen-calculator-americans" element={<USACitizensPage />} />
            <Route path="schengen-calculator-uk" element={<UKCitizensPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
);
