import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { CompanyList } from './pages/companies/CompanyList';
import { AddCompany } from './pages/companies/AddCompany';
import { TaxRecording } from './pages/tax-recording/TaxRecording';
import { TaxFormulas } from './pages/TaxFormulas';
import { Reports } from './pages/Reports';
import { PersonalTax } from './pages/PersonalTax';
import { TaxPlanner } from './pages/TaxPlanner';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Settings } from './pages/Settings';
import { SPTRepository } from './pages/SPTRepository';
import { PersonalNotes } from './pages/PersonalNotes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="companies" element={<CompanyList />} />
          <Route path="companies/new" element={<AddCompany />} />
          <Route path="personal-tax" element={<PersonalTax />} />
          <Route path="spt-repository" element={<SPTRepository />} />
          <Route path="personal-notes" element={<PersonalNotes />} />
          <Route path="tax-recording" element={<TaxRecording />} />
          <Route path="tax-formulas" element={<TaxFormulas />} />
          <Route path="reports" element={<Reports />} />
          <Route path="tax-planner" element={<TaxPlanner />} />
          <Route path="settings" element={<Settings />} />
          <Route path="notifications" element={<div>Notifications Page (Coming Soon)</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
