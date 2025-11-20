import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { useAuthStore } from '@/store/authStore';
import { userOrderService } from '@/services/userOrderService';
import { gearService } from '@/services/gearService';
import { UserOrder, Gear } from '@/types';
import { routes } from '@/config';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(price);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getStatusInfo = (status: UserOrder['status']) => {
  switch (status) {
    case 'waiting':
      return {
        label: '⏳ Bekleniyor',
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-800 dark:text-yellow-200',
        border: 'border-yellow-200 dark:border-yellow-800',
      };
    case 'arrived':
      return {
        label: '📦 Ürün Geldi',
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-800 dark:text-blue-200',
        border: 'border-blue-200 dark:border-blue-800',
      };
    case 'shipped':
      return {
        label: '🚚 Yola Çıktı',
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-800 dark:text-green-200',
        border: 'border-green-200 dark:border-green-800',
      };
    default:
      return {
        label: status,
        bg: 'bg-gray-100 dark:bg-gray-700',
        text: 'text-gray-800 dark:text-gray-200',
        border: 'border-gray-200 dark:border-gray-600',
      };
  }
};

export const ProfilePage = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [gears, setGears] = useState<Record<string, Gear>>({});
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (activeTab === 'orders' && user?.id) {
      loadOrders();
    }
  }, [activeTab, user?.id]);

  const loadOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const userOrders = await userOrderService.getOrders(user?.id);
      setOrders(userOrders);

      // Ürün bilgilerini yükle
      const gearIds = [...new Set(userOrders.map(o => o.gearId))];
      const gearMap: Record<string, Gear> = {};
      
      for (const gearId of gearIds) {
        try {
          const gear = await gearService.getGearById(gearId);
          gearMap[gearId] = gear;
        } catch (error) {
          console.error(`Failed to load gear ${gearId}:`, error);
        }
      }
      
      setGears(gearMap);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (statusFilter === 'all') return true;
    return order.status === statusFilter;
  });

  return (
    <>
      <SEO title="Profilim" description="Profil bilgilerinizi görüntüleyin" />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Profilim
          </h1>

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Profil Bilgileri
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Siparişlerim {orders.length > 0 && `(${orders.length})`}
              </button>
            </nav>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Profil Bilgileri
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ad Soyad
                  </label>
                  <p className="text-gray-900 dark:text-white">{user?.name || 'Belirtilmemiş'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    E-posta
                  </label>
                  <p className="text-gray-900 dark:text-white">{user?.email || 'Belirtilmemiş'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rol
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {user?.role === 'admin' ? 'Yönetici' : 'Kullanıcı'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              {/* Filter */}
              {orders.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Durum Filtresi:
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="all">Tümü</option>
                      <option value="waiting">⏳ Bekleniyor</option>
                      <option value="arrived">📦 Ürün Geldi</option>
                      <option value="shipped">🚚 Yola Çıktı</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Orders List */}
              {isLoadingOrders ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {orders.length === 0 ? 'Henüz siparişiniz yok' : 'Bu filtreye uygun sipariş bulunamadı'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {orders.length === 0
                      ? 'Siparişleriniz burada görünecek'
                      : 'Farklı bir filtre deneyin'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => {
                    const gear = gears[order.gearId];
                    const statusInfo = getStatusInfo(order.status);

                    return (
                      <div
                        key={order.id}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex flex-col md:flex-row gap-6">
                          {/* Product Image */}
                          {gear?.images?.[0] && (
                            <div className="flex-shrink-0">
                              <img
                                src={gear.images[0]}
                                alt={gear.name}
                                className="w-24 h-24 object-cover rounded-lg"
                              />
                            </div>
                          )}

                          {/* Order Details */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                  {gear?.name || 'Ürün bilgisi yükleniyor...'}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Sipariş Tarihi: {formatDate(order.createdAt)}
                                </p>
                              </div>
                              <div
                                className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border} border`}
                              >
                                {statusInfo.label}
                              </div>
                            </div>

                            {/* Price */}
                            <div className="mb-4">
                              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                {formatPrice(order.price)}
                              </span>
                            </div>

                            {/* Shipped Info */}
                            {order.status === 'shipped' && order.shippedDate && (
                              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                <p className="text-sm text-green-800 dark:text-green-200">
                                  <strong>Yola Çıktı:</strong> {formatDate(order.shippedDate)}
                                  {order.shippedTime && ` saat ${order.shippedTime}`}
                                </p>
                              </div>
                            )}

                            {/* Public Note */}
                            {order.publicNote && (
                              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                  <strong>Not:</strong> {order.publicNote}
                                </p>
                              </div>
                            )}

                            {/* Product Link */}
                            {gear && (
                              <Link
                                to={`${routes.gearDetails.replace(':id', gear.id)}`}
                                className="text-sm text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
                              >
                                Ürün detaylarına git →
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};


