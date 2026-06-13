import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function AdminLayout() {
  const token = localStorage.getItem('token');
  
  // Commented out to allow Dashboard to be the first page as requested
  // if (!token) {
  //   return <Navigate to="/login" replace />;
  // }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 w-full">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
