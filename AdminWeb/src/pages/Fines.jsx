import { useState, useEffect } from 'react';
import { Trash2, Edit2 } from 'lucide-react';
import api from '../api/axios';

export default function Fines() {
  const [fines, setFines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFine, setCurrentFine] = useState(null);

  const fetchFines = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/fines');
      setFines(res.data);
    } catch (err) {
      console.error('Failed to fetch fines:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFines();
  }, []);

  const handleEditStatus = (fine) => {
    setCurrentFine({ ...fine });
    setIsModalOpen(true);
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/fines/${currentFine.id}`, currentFine);
      setIsModalOpen(false);
      fetchFines();
    } catch (err) {
      console.error('Failed to update fine:', err);
      alert('Failed to update fine status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this fine record?')) return;
    try {
      await api.delete(`/fines/${id}`);
      fetchFines();
    } catch (err) {
      console.error('Failed to delete fine:', err);
      alert('Failed to delete fine.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Issued Fines</h2>
        <p className="mt-1 text-sm text-gray-500">View and manage all issued traffic fines.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Loading fines...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ref #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver / Officer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue / Due Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount (LKR)</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {fines.map((fine) => (
                  <tr key={fine.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {fine.referenceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>Driver: {fine.driverId}</div>
                      <div className="text-xs text-gray-400">Officer: {fine.officerId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{formatDate(fine.issueDate)}</div>
                      <div className="text-xs text-red-400 font-medium">{formatDate(fine.dueDate)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                      {fine.amount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          fine.status === 'PAID'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {fine.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <button
                        onClick={() => handleEditStatus(fine)}
                        className="text-blue-600 hover:text-blue-900 mx-2 p-1 rounded hover:bg-blue-50"
                        title="Update Status"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(fine.id)}
                        className="text-red-600 hover:text-red-900 mx-2 p-1 rounded hover:bg-red-50"
                        title="Delete Fine"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {fines.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No fines found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && currentFine && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Update Fine Status</h3>
              <p className="text-sm text-gray-500 mt-1">Ref: {currentFine.referenceNumber}</p>
            </div>
            <form onSubmit={handleSaveStatus} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={currentFine.status}
                  onChange={(e) => setCurrentFine({ ...currentFine, status: e.target.value })}
                >
                  <option value="UNPAID">UNPAID</option>
                  <option value="PAID">PAID</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
