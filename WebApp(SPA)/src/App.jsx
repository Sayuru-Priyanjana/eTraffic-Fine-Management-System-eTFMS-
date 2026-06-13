import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import QuickPay from './pages/QuickPay';
import PaymentSuccess from './pages/PaymentSuccess';

export default function App() {
  console.log("App component: Rendering all routes...");
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        {/* Navigation Bar */}
        <Navbar />

        {/* Core Page Content Area */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/quick-pay" element={<QuickPay />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            
            {/* Fallback to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Shared Page Footer */}
        <Footer />
      </div>
    </BrowserRouter>
  );
}
