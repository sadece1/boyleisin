import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCampsiteStore } from '@/store/campsiteStore';
import { SEO } from '@/components/SEO';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { routes } from '@/config';
import { Campsite } from '@/types';

export const AdminCampsitesPage = () => {
  const { campsites, fetchCampsites, isLoading, deleteCampsite } = useCampsiteStore();

  useEffect(() => {
    fetchCampsites({}, 1);
  }, [fetchCampsites]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu kamp alanını silmek istediğinizden emin misiniz?')) {
      try {
        await deleteCampsite(id);
        fetchCampsites({}, 1);
      } catch (error) {
        alert('Silme işlemi başarısız oldu');
      }
    }
  };

  return (
    <>
      <SEO title="Kamp Alanları Yönetimi" description="Kamp alanlarını yönetin" />
      <AdminLayout>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Kamp Alanları Yönetimi
          </h1>
          <Link to={routes.adminAddCampsite}>
            <Button variant="primary">Yeni Kamp Alanı Ekle</Button>
          </Link>
        </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Ad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Konum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Fiyat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {campsites.length > 0 ? (
                    campsites.map((campsite: Campsite) => (
                    <tr key={campsite.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {campsite.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {campsite.location.city}, {campsite.location.region}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        ₺{campsite.pricePerNight}/gece
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            campsite.available
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {campsite.available ? 'Müsait' : 'Dolu'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/admin/campsites/edit/${campsite.id}`}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-4"
                        >
                          Düzenle
                        </Link>
                        <button
                          onClick={() => handleDelete(campsite.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                        Henüz kamp alanı eklenmemiş
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
      </AdminLayout>
    </>
  );
};

