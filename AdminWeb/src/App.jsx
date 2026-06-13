import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Categories from './pages/Categories';
import Fines from './pages/Fines';
import PoliceOfficers from './pages/PoliceOfficers';
import Drivers from './pages/Drivers';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/fines" element={<Fines />} />
          <Route path="/officers" element={<PoliceOfficers />} />
          <Route path="/drivers" element={<Drivers />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
