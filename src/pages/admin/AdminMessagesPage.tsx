import { useEffect, useState } from 'react';
import { useMessageStore } from '@/store/messageStore';
import { SEO } from '@/components/SEO';
import { AdminLayout } from '@/components/AdminLayout';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Message } from '@/types';
import { formatDate } from '@/utils/validation';

export const AdminMessagesPage = () => {
  const { messages, fetchMessages, isLoading, markAsRead, deleteMessage } = useMessageStore();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    fetchMessages(1);
  }, [fetchMessages]);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
    if (selectedMessage?.id === id) {
      setSelectedMessage({ ...selectedMessage, read: true });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu mesajı silmek istediğinizden emin misiniz?')) {
      try {
        await deleteMessage(id);
        if (selectedMessage?.id === id) {
          setSelectedMessage(null);
        }
      } catch (error) {
        alert('Silme işlemi başarısız oldu');
      }
    }
  };

  return (
    <>
      <SEO title="Mesajlar" description="Gelen mesajları yönetin" />
      <AdminLayout>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Mesajlar
        </h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Message List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Gelen Mesajlar ({messages.length})
                </h2>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
                {messages.length > 0 ? (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => {
                        setSelectedMessage(message);
                        if (!message.read) {
                          handleMarkAsRead(message.id);
                        }
                      }}
                      className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        selectedMessage?.id === message.id
                          ? 'bg-primary-50 dark:bg-primary-900'
                          : message.read
                          ? 'bg-white dark:bg-gray-800'
                          : 'bg-blue-50 dark:bg-blue-900'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {message.name}
                            </h3>
                            {!message.read && (
                              <span className="bg-primary-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                !
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                            {message.subject}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {formatDate(message.createdAt)}
                          </p>
                        </div>
                        <a
                          href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="ml-2 px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800"
                          title="Yanıtla"
                        >
                          📧
                        </a>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    Henüz mesaj yok
                  </div>
                )}
              </div>
            </div>

            {/* Message Detail */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              {selectedMessage ? (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Mesaj Detayı
                    </h2>
                    <div className="flex space-x-2">
                      {!selectedMessage.read && (
                        <button
                          onClick={() => handleMarkAsRead(selectedMessage.id)}
                          className="px-3 py-1 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                        >
                          Okundu İşaretle
                        </button>
                      )}
                      <a
                        href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}&body=${encodeURIComponent(`\n\n--- Orijinal Mesaj ---\nGönderen: ${selectedMessage.name}\nTarih: ${formatDate(selectedMessage.createdAt)}\nKonu: ${selectedMessage.subject}\n\n${selectedMessage.message}`)}`}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        📧 Yanıtla
                      </a>
                      <button
                        onClick={() => handleDelete(selectedMessage.id)}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Gönderen
                      </label>
                      <p className="mt-1 text-gray-900 dark:text-white">{selectedMessage.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        E-posta
                      </label>
                      <div className="mt-1 flex items-center space-x-2">
                        <a href={`mailto:${selectedMessage.email}`} className="text-primary-600 hover:underline">
                          {selectedMessage.email}
                        </a>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(selectedMessage.email);
                            alert('E-posta adresi kopyalandı!');
                          }}
                          className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                          title="E-posta adresini kopyala"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Konu
                      </label>
                      <p className="mt-1 text-gray-900 dark:text-white">{selectedMessage.subject}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Mesaj
                      </label>
                      <p className="mt-1 text-gray-900 dark:text-white whitespace-pre-wrap">
                        {selectedMessage.message}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tarih
                      </label>
                      <p className="mt-1 text-gray-900 dark:text-white">
                        {formatDate(selectedMessage.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  Bir mesaj seçin
                </div>
              )}
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  );
};

