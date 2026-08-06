import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { hydrateRoot } from 'react-dom/client';
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
  UKCitizensPage,
  CountDaysPage,
  OverstayRulesPage
} from './pages/SEOPages.tsx';
import './index.css';

const container = document.getElementById('root')!;

const app = (
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<HomePage />} />
            <Route path="schengen-calculator" element={<SchengenCalculatorPage />} />
            <Route path="90-180-rule" element={<NinetyDayRulePage />} />
            <Route path="schengen-visa-calculator" element={<SchengenVisaCalculatorPage />} />
            <Route path="how-many-days-can-i-stay-in-europe" element={<HowManyDaysPage />} />
            <Route path="when-can-i-return-to-schengen" element={<WhenCanIReturnPage />} />
            <Route path="schengen-calculator-americans" element={<USACitizensPage />} />
            <Route path="schengen-calculator-uk" element={<UKCitizensPage />} />
            <Route path="how-to-count-schengen-days" element={<CountDaysPage />} />
            <Route path="schengen-overstay-rules" element={<OverstayRulesPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
);

if (container.hasChildNodes()) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
