import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Shield } from 'lucide-react';
import api from '../api/axios';

export default function PoliceOfficers() {
  const [officers, setOfficers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOfficer, setCurrentOfficer] = useState({ id: '', username: '', password: '' });
  const [isEditing, setIsEditing] = useState(false);

  const fetchOfficers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/users/role/POLICE_OFFICER');
      setOfficers(res.data);
    } catch (err) {
      console.error('Failed to fetch officers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficers();
  }, []);

  const handleOpenModal = (officer = null) => {
    if (officer) {
      setCurrentOfficer({ id: officer.id, username: officer.username, password: '' });
      setIsEditing(true);
    } else {
      setCurrentOfficer({ id: '', username: '', password: '' });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/users/${currentOfficer.id}`, {
          username: currentOfficer.username,
          password: currentOfficer.password
        });
      } else {
        await api.post('/users', {
          id: currentOfficer.id,
          username: currentOfficer.username,
          password: currentOfficer.password,
          role: 'POLICE_OFFICER'
        });
      }
      setIsModalOpen(false);
      fetchOfficers();
    } catch (err) {
      console.error('Failed to save officer:', err);
      alert('Failed to save officer. Please check inputs and try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this officer?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchOfficers();
    } catch (err) {
      console.error('Failed to delete officer:', err);
      alert('Failed to delete officer.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            Police Officers
          </h2>
          <p className="mt-1 text-sm text-gray-500">Manage police officer accounts.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Officer
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Loading officers...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Officer ID (Badge Number)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {officers.map((officer) => (
                  <tr key={officer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{officer.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{officer.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <button
                        onClick={() => handleOpenModal(officer)}
                        className="text-blue-600 hover:text-blue-900 mx-2 p-1 rounded hover:bg-blue-50"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(officer.id)}
                        className="text-red-600 hover:text-red-900 mx-2 p-1 rounded hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {officers.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-gray-500">No officers found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {isEditing ? 'Edit Police Officer' : 'Add New Police Officer'}
              </h3>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {!isEditing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Officer ID / Badge Number</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={currentOfficer.id}
                    onChange={(e) => setCurrentOfficer({ ...currentOfficer, id: e.target.value })}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={currentOfficer.username}
                  onChange={(e) => setCurrentOfficer({ ...currentOfficer, username: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isEditing ? 'New Password (leave blank to keep current)' : 'Password'}
                </label>
                <input
                  type="password"
                  required={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={currentOfficer.password}
                  onChange={(e) => setCurrentOfficer({ ...currentOfficer, password: e.target.value })}
                />
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
                  {isEditing ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
