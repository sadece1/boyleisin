import { useEffect } from 'react';
import { useNewsletterStore } from '@/store/newsletterStore';
import { SEO } from '@/components/SEO';
import { AdminLayout } from '@/components/AdminLayout';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { NewsletterSubscription } from '@/types';
import { formatDate } from '@/utils/validation';

export const AdminNewslettersPage = () => {
  const { subscriptions, fetchSubscriptions, isLoading, unsubscribe, deleteSubscription } = useNewsletterStore();

  useEffect(() => {
    fetchSubscriptions(1);
  }, [fetchSubscriptions]);

  const handleUnsubscribe = async (id: string) => {
    if (window.confirm('Bu aboneliği iptal etmek istediğinizden emin misiniz?')) {
      try {
        await unsubscribe(id);
      } catch (error) {
        alert('İşlem başarısız oldu');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu aboneliği silmek istediğinizden emin misiniz?')) {
      try {
        await deleteSubscription(id);
      } catch (error) {
        alert('Silme işlemi başarısız oldu');
      }
    }
  };

  const handleExport = () => {
    const csv = [
      ['E-posta', 'Abone Durumu', 'Abone Olma Tarihi'].join(','),
      ...subscriptions.map((sub) =>
        [
          sub.email,
          sub.subscribed ? 'Aktif' : 'İptal',
          formatDate(sub.subscribedAt),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `newsletter-subscriptions-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const activeSubscriptions = subscriptions.filter((s) => s.subscribed).length;

  return (
    <>
      <SEO title="Bülten Abonelikleri" description="Bülten aboneliklerini yönetin" />
      <AdminLayout>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Bülten Abonelikleri
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Toplam: {subscriptions.length} | Aktif: {activeSubscriptions} | İptal: {subscriptions.length - activeSubscriptions}
            </p>
          </div>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            📥 CSV Dışa Aktar
          </button>
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
                    E-posta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Abone Olma Tarihi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    İptal Tarihi
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {subscriptions.length > 0 ? (
                  subscriptions.map((subscription: NewsletterSubscription) => (
                    <tr key={subscription.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {subscription.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            subscription.subscribed
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {subscription.subscribed ? 'Aktif' : 'İptal'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {formatDate(subscription.subscribedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {subscription.unsubscribedAt ? formatDate(subscription.unsubscribedAt) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {subscription.subscribed && (
                          <button
                            onClick={() => handleUnsubscribe(subscription.id)}
                            className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 mr-4"
                          >
                            İptal Et
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(subscription.id)}
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
                      Henüz abone yok
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

