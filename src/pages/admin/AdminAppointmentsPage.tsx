import { useEffect, useState } from 'react';
import { useAppointmentStore } from '@/store/appointmentStore';
import { SEO } from '@/components/SEO';
import { AdminLayout } from '@/components/AdminLayout';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Appointment } from '@/types';
import { formatDate } from '@/utils/validation';

export const AdminAppointmentsPage = () => {
  const { appointments, fetchAppointments, isLoading, updateStatus, deleteAppointment, setStatusFilter, statusFilter } = useAppointmentStore();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    fetchAppointments(1, statusFilter ? { status: statusFilter } : undefined);
  }, [fetchAppointments, statusFilter]);

  const handleStatusChange = async (id: string, status: Appointment['status']) => {
    try {
      await updateStatus(id, status);
      if (selectedAppointment?.id === id) {
        setSelectedAppointment({ ...selectedAppointment, status });
      }
    } catch (error) {
      alert('Durum güncellenemedi');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu randevuyu silmek istediğinizden emin misiniz?')) {
      try {
        await deleteAppointment(id);
        if (selectedAppointment?.id === id) {
          setSelectedAppointment(null);
        }
      } catch (error) {
        alert('Silme işlemi başarısız oldu');
      }
    }
  };

  const statusCounts = {
    pending: appointments.filter((a) => a.status === 'pending').length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    cancelled: appointments.filter((a) => a.status === 'cancelled').length,
    completed: appointments.filter((a) => a.status === 'completed').length,
  };

  return (
    <>
      <SEO title="Randevular" description="Randevuları yönetin" />
      <AdminLayout>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Randevular
        </h1>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => {
              setStatusFilter(undefined);
              fetchAppointments(1);
            }}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Tümü ({appointments.length})
          </button>
          <button
            onClick={() => {
              setStatusFilter('pending');
              fetchAppointments(1, { status: 'pending' });
            }}
            className="px-4 py-2 bg-yellow-200 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-lg hover:bg-yellow-300 dark:hover:bg-yellow-800"
          >
            Beklemede ({statusCounts.pending})
          </button>
          <button
            onClick={() => {
              setStatusFilter('confirmed');
              fetchAppointments(1, { status: 'confirmed' });
            }}
            className="px-4 py-2 bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg hover:bg-green-300 dark:hover:bg-green-800"
          >
            Onaylandı ({statusCounts.confirmed})
          </button>
          <button
            onClick={() => {
              setStatusFilter('cancelled');
              fetchAppointments(1, { status: 'cancelled' });
            }}
            className="px-4 py-2 bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg hover:bg-red-300 dark:hover:bg-red-800"
          >
            İptal ({statusCounts.cancelled})
          </button>
          <button
            onClick={() => {
              setStatusFilter('completed');
              fetchAppointments(1, { status: 'completed' });
            }}
            className="px-4 py-2 bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg hover:bg-blue-300 dark:hover:bg-blue-800"
          >
            Tamamlandı ({statusCounts.completed})
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Appointment List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Randevu Listesi
                </h2>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
                {appointments.length > 0 ? (
                  appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      onClick={() => setSelectedAppointment(appointment)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        selectedAppointment?.id === appointment.id
                          ? 'bg-primary-50 dark:bg-primary-900'
                          : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {appointment.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {appointment.date} - {appointment.time}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {appointment.serviceType || 'Genel'}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            appointment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : appointment.status === 'confirmed'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : appointment.status === 'cancelled'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          }`}
                        >
                          {appointment.status === 'pending' ? 'Beklemede' :
                           appointment.status === 'confirmed' ? 'Onaylandı' :
                           appointment.status === 'cancelled' ? 'İptal' : 'Tamamlandı'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    Randevu bulunamadı
                  </div>
                )}
              </div>
            </div>

            {/* Appointment Detail */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              {selectedAppointment ? (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Randevu Detayı
                    </h2>
                    <button
                      onClick={() => handleDelete(selectedAppointment.id)}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Sil
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Ad Soyad
                      </label>
                      <p className="mt-1 text-gray-900 dark:text-white">{selectedAppointment.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        E-posta
                      </label>
                      <p className="mt-1 text-gray-900 dark:text-white">
                        <a href={`mailto:${selectedAppointment.email}`} className="text-primary-600 hover:underline">
                          {selectedAppointment.email}
                        </a>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Telefon
                      </label>
                      <p className="mt-1 text-gray-900 dark:text-white">
                        <a href={`tel:${selectedAppointment.phone}`} className="text-primary-600 hover:underline">
                          {selectedAppointment.phone}
                        </a>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tarih ve Saat
                      </label>
                      <p className="mt-1 text-gray-900 dark:text-white">
                        {selectedAppointment.date} - {selectedAppointment.time}
                      </p>
                    </div>
                    {selectedAppointment.serviceType && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Hizmet Tipi
                        </label>
                        <p className="mt-1 text-gray-900 dark:text-white">{selectedAppointment.serviceType}</p>
                      </div>
                    )}
                    {selectedAppointment.message && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Mesaj
                        </label>
                        <p className="mt-1 text-gray-900 dark:text-white whitespace-pre-wrap">
                          {selectedAppointment.message}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Durum
                      </label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          onClick={() => handleStatusChange(selectedAppointment.id, 'pending')}
                          className={`px-3 py-1 text-sm rounded-lg ${
                            selectedAppointment.status === 'pending'
                              ? 'bg-yellow-600 text-white'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-200'
                          }`}
                        >
                          Beklemede
                        </button>
                        <button
                          onClick={() => handleStatusChange(selectedAppointment.id, 'confirmed')}
                          className={`px-3 py-1 text-sm rounded-lg ${
                            selectedAppointment.status === 'confirmed'
                              ? 'bg-green-600 text-white'
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200'
                          }`}
                        >
                          Onayla
                        </button>
                        <button
                          onClick={() => handleStatusChange(selectedAppointment.id, 'cancelled')}
                          className={`px-3 py-1 text-sm rounded-lg ${
                            selectedAppointment.status === 'cancelled'
                              ? 'bg-red-600 text-white'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-200'
                          }`}
                        >
                          İptal Et
                        </button>
                        <button
                          onClick={() => handleStatusChange(selectedAppointment.id, 'completed')}
                          className={`px-3 py-1 text-sm rounded-lg ${
                            selectedAppointment.status === 'completed'
                              ? 'bg-blue-600 text-white'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200'
                          }`}
                        >
                          Tamamlandı
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Oluşturma Tarihi
                      </label>
                      <p className="mt-1 text-gray-900 dark:text-white">
                        {formatDate(selectedAppointment.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  Bir randevu seçin
                </div>
              )}
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  );
};

