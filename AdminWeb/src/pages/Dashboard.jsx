import { useState, useEffect } from 'react';
import { Activity, CreditCard, FileText } from 'lucide-react';
import api from '../api/axios';

export default function Dashboard() {
  const [fines, setFines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [finesRes, catsRes] = await Promise.all([
          api.get('/fines'),
          api.get('/categories'),
        ]);
        setFines(finesRes.data);
        setCategories(catsRes.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Calculate Metrics
  const totalFines = fines.length;
  const paidFines = fines.filter((f) => f.status === 'PAID').length;
  const unpaidFines = totalFines - paidFines;
  const totalCollections = fines
    .filter((f) => f.status === 'PAID')
    .reduce((sum, f) => sum + (f.amount || 0), 0);

  // Fines by Category Breakdown
  const categoryBreakdown = categories.map((cat) => {
    const catFines = fines.filter((f) => f.categoryId === cat.id);
    const count = catFines.length;
    const revenue = catFines
      .filter((f) => f.status === 'PAID')
      .reduce((sum, f) => sum + (f.amount || 0), 0);
    return { ...cat, count, revenue };
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="mt-1 text-sm text-gray-500">
          Monitor your traffic fine collections and metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Collections</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                LKR {totalCollections.toLocaleString()}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Fines Issued</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{totalFines}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <span className="font-medium text-green-600">{paidFines} Paid</span>
            <span className="mx-2">•</span>
            <span className="font-medium text-red-600">{unpaidFines} Unpaid</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Categories</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {categories.length}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-xl">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Fine Breakdown by Category</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fines Issued
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue Collected
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categoryBreakdown.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {cat.identifier}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {cat.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {cat.count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium text-right">
                    LKR {cat.revenue.toLocaleString()}
                  </td>
                </tr>
              ))}
              {categoryBreakdown.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    No data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
