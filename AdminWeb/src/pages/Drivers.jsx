import { useState, useEffect } from 'react';
import { Users, Trash2 } from 'lucide-react';
import api from '../api/axios';

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDrivers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/users/role/DRIVER');
      setDrivers(res.data);
    } catch (err) {
      console.error('Failed to fetch drivers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this driver?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchDrivers();
    } catch (err) {
      console.error('Failed to delete driver:', err);
      alert('Failed to delete driver. They might have existing fines tied to them.');
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Drivers
          </h2>
          <p className="mt-1 text-sm text-gray-500">View all registered drivers in the system.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Loading drivers...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver License ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {drivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{driver.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{driver.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <button
                        onClick={() => handleDelete(driver.id)}
                        className="text-red-600 hover:text-red-900 mx-2 p-1 rounded hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {drivers.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-gray-500">No drivers found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
