import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { SEO } from '@/components/SEO';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { userOrderService } from '@/services/userOrderService';
import { authService } from '@/services/authService';
import { gearService } from '@/services/gearService';
import { useGearStore } from '@/store/gearStore';
import { UserOrder, UserOrderForm, User, Gear } from '@/types';

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
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusInfo = (status: UserOrder['status']) => {
  switch (status) {
    case 'waiting':
      return {
        label: '⏳ Bekleniyor',
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-800 dark:text-yellow-200',
      };
    case 'arrived':
      return {
        label: '📦 Ürün Geldi',
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-800 dark:text-blue-200',
      };
    case 'shipped':
      return {
        label: '🚚 Yola Çıktı',
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-800 dark:text-green-200',
      };
    default:
      return {
        label: status,
        bg: 'bg-gray-100 dark:bg-gray-700',
        text: 'text-gray-800 dark:text-gray-200',
      };
  }
};

export const AdminUserOrdersPage = () => {
  const { gear, fetchGear } = useGearStore();
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [gears, setGears] = useState<Record<string, Gear>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingGears, setIsLoadingGears] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<UserOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<UserOrderForm>({
    defaultValues: {
      status: 'waiting',
      price: 0,
    },
  });

  const selectedStatus = watch('status');

  useEffect(() => {
    loadOrders();
    loadUsers();
    loadGears();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const allOrders = await userOrderService.getOrders();
      setOrders(allOrders);

      // Ürün bilgilerini yükle
      const gearIds = [...new Set(allOrders.map(o => o.gearId))];
      const gearMap: Record<string, Gear> = {};
      
      for (const gearId of gearIds) {
        try {
          const gearItem = await gearService.getGearById(gearId);
          gearMap[gearId] = gearItem;
        } catch (error) {
          console.error(`Failed to load gear ${gearId}:`, error);
        }
      }
      
      setGears(gearMap);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const allUsers = await authService.getAllUsers();
      setUsers(allUsers.filter(u => u.role === 'user')); // Sadece kullanıcıları al
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const loadGears = async () => {
    setIsLoadingGears(true);
    try {
      await fetchGear({}, 1, 10000);
    } catch (error) {
      console.error('Failed to load gears:', error);
    } finally {
      setIsLoadingGears(false);
    }
  };

  const onSubmit = async (data: UserOrderForm) => {
    try {
      if (editingOrder) {
        await userOrderService.updateOrder(editingOrder.id, data);
      } else {
        await userOrderService.createOrder(data);
      }
      
      reset();
      setIsFormOpen(false);
      setEditingOrder(null);
      loadOrders();
    } catch (error: any) {
      alert(error.message || 'Sipariş kaydedilemedi');
    }
  };

  const handleEdit = (order: UserOrder) => {
    setEditingOrder(order);
    setValue('userId', order.userId);
    setValue('gearId', order.gearId);
    setValue('status', order.status);
    setValue('price', order.price);
    setValue('publicNote', order.publicNote || '');
    setValue('privateNote', order.privateNote || '');
    setValue('shippedDate', order.shippedDate || '');
    setValue('shippedTime', order.shippedTime || '');
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu siparişi silmek istediğinize emin misiniz?')) return;
    
    try {
      await userOrderService.deleteOrder(id);
      loadOrders();
    } catch (error: any) {
      alert(error.message || 'Sipariş silinemedi');
    }
  };

  const handleCancel = () => {
    reset();
    setIsFormOpen(false);
    setEditingOrder(null);
  };

  const filteredOrders = orders.filter(order => {
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;
    if (userFilter !== 'all' && order.userId !== userFilter) return false;
    if (searchQuery) {
      const gear = gears[order.gearId];
      const user = users.find(u => u.id === order.userId);
      const searchLower = searchQuery.toLowerCase();
      return (
        gear?.name.toLowerCase().includes(searchLower) ||
        user?.name.toLowerCase().includes(searchLower) ||
        user?.email.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  return (
    <>
      <SEO title="Sipariş Yönetimi" description="Kullanıcı siparişlerini yönetin" />
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Sipariş Yönetimi
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Kullanıcı siparişlerini oluşturun ve yönetin
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => {
                reset();
                setEditingOrder(null);
                setIsFormOpen(true);
              }}
            >
              + Yeni Sipariş Ekle
            </Button>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Arama
                </label>
                <input
                  type="text"
                  placeholder="Ürün veya kullanıcı ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Durum
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">Tümü</option>
                  <option value="waiting">⏳ Bekleniyor</option>
                  <option value="arrived">📦 Ürün Geldi</option>
                  <option value="shipped">🚚 Yola Çıktı</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kullanıcı
                </label>
                <select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">Tümü</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Form Modal */}
          <AnimatePresence>
            {isFormOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={handleCancel}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4"
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                  >
                    <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {editingOrder ? 'Sipariş Düzenle' : 'Yeni Sipariş Ekle'}
                      </h2>
                      <button
                        onClick={handleCancel}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                      >
                        ×
                      </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                      {/* Kullanıcı Seçimi */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Kullanıcı *
                        </label>
                        {isLoadingUsers ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <select
                            {...register('userId', { required: 'Kullanıcı seçimi gereklidir' })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="">Kullanıcı seçin...</option>
                            {users.map((user) => (
                              <option key={user.id} value={user.id}>
                                {user.name} ({user.email})
                              </option>
                            ))}
                          </select>
                        )}
                        {errors.userId && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {errors.userId.message}
                          </p>
                        )}
                      </div>

                      {/* Ürün Seçimi */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Ürün *
                        </label>
                        {isLoadingGears ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <select
                            {...register('gearId', { required: 'Ürün seçimi gereklidir' })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="">Ürün seçin...</option>
                            {gear.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name} - {formatPrice(item.pricePerDay)}
                              </option>
                            ))}
                          </select>
                        )}
                        {errors.gearId && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {errors.gearId.message}
                          </p>
                        )}
                      </div>

                      {/* Durum */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Durum *
                        </label>
                        <select
                          {...register('status', { required: 'Durum seçimi gereklidir' })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="waiting">⏳ Bekleniyor</option>
                          <option value="arrived">📦 Ürün Geldi</option>
                          <option value="shipped">🚚 Yola Çıktı</option>
                        </select>
                      </div>

                      {/* Fiyat */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Fiyat (₺) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          {...register('price', {
                            required: 'Fiyat gereklidir',
                            min: { value: 0, message: 'Fiyat 0\'dan büyük olmalıdır' },
                            valueAsNumber: true,
                          })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        />
                        {errors.price && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {errors.price.message}
                          </p>
                        )}
                      </div>

                      {/* Yola Çıktı Tarihi ve Saati (Sadece shipped durumunda) */}
                      {selectedStatus === 'shipped' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Yola Çıktı Tarihi *
                            </label>
                            <input
                              type="date"
                              {...register('shippedDate', {
                                required: selectedStatus === 'shipped' ? 'Tarih gereklidir' : false,
                              })}
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                            />
                            {errors.shippedDate && (
                              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                {errors.shippedDate.message}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Yola Çıktı Saati *
                            </label>
                            <input
                              type="time"
                              {...register('shippedTime', {
                                required: selectedStatus === 'shipped' ? 'Saat gereklidir' : false,
                              })}
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                            />
                            {errors.shippedTime && (
                              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                {errors.shippedTime.message}
                              </p>
                            )}
                          </div>
                        </>
                      )}

                      {/* Kullanıcıya Gösterilecek Not */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Kullanıcıya Gösterilecek Not
                        </label>
                        <textarea
                          {...register('publicNote')}
                          rows={3}
                          placeholder="Bu not kullanıcı tarafından görülecektir..."
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 resize-none"
                        />
                      </div>

                      {/* Özel Not (Sadece Admin) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Özel Not (Sadece Admin Görür)
                        </label>
                        <textarea
                          {...register('privateNote')}
                          rows={3}
                          placeholder="Bu not sadece admin tarafından görülecektir..."
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 resize-none"
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 pt-4">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={handleCancel}
                          className="flex-1"
                        >
                          İptal
                        </Button>
                        <Button type="submit" variant="primary" className="flex-1">
                          {editingOrder ? 'Güncelle' : 'Kaydet'}
                        </Button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Orders List */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Sipariş bulunamadı
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {orders.length === 0
                  ? 'Henüz sipariş eklenmemiş'
                  : 'Filtrelere uygun sipariş bulunamadı'}
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Kullanıcı
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Ürün
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Durum
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Fiyat
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Notlar
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Tarih
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredOrders.map((order) => {
                      const gear = gears[order.gearId];
                      const user = users.find(u => u.id === order.userId);
                      const statusInfo = getStatusInfo(order.status);

                      return (
                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {user?.name || 'Bilinmeyen'}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {user?.email || '-'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {gear?.name || 'Ürün yükleniyor...'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.bg} ${statusInfo.text}`}
                            >
                              {statusInfo.label}
                            </span>
                            {order.status === 'shipped' && order.shippedDate && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {formatDate(order.shippedDate)}
                                {order.shippedTime && ` ${order.shippedTime}`}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {formatPrice(order.price)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {order.publicNote && (
                                <div className="mb-1">
                                  <span className="text-xs text-gray-500">Kullanıcı:</span> {order.publicNote}
                                </div>
                              )}
                              {order.privateNote && (
                                <div>
                                  <span className="text-xs text-gray-500">Admin:</span> {order.privateNote}
                                </div>
                              )}
                              {!order.publicNote && !order.privateNote && (
                                <span className="text-gray-400">-</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEdit(order)}
                                className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300"
                              >
                                Düzenle
                              </button>
                              <button
                                onClick={() => handleDelete(order.id)}
                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                              >
                                Sil
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
};





