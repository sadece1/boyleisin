import { useEffect, useState } from 'react';
import { SEO } from '@/components/SEO';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { User } from '@/types';
import api from '@/services/api';

export const AdminUsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Add form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'user' | 'admin'>('user');
  
  // Edit form state
  const [editingName, setEditingName] = useState('');
  const [editingEmail, setEditingEmail] = useState('');
  const [editingRole, setEditingRole] = useState<'user' | 'admin'>('user');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<{ success: boolean; data: any[]; pagination?: any }>('/admin/users');
      if (response.data.success && response.data.data) {
        setUsers(response.data.data.map((u: any) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          avatar: u.avatar,
          createdAt: u.created_at || u.createdAt || new Date().toISOString(),
          updatedAt: u.updated_at || u.updatedAt || new Date().toISOString(),
        })));
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      alert('Kullanıcılar yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
      alert('Lütfen tüm alanları doldurun');
      return;
    }

    try {
      // Register new user via API
      await api.post('/auth/register', {
        name: newName.trim(),
        email: newEmail.trim(),
        password: newPassword,
      });

      // If role is admin, update it
      if (newRole === 'admin') {
        // First get the user ID from the response or find by email
        const usersResponse = await api.get<{ success: boolean; data: any[] }>('/admin/users');
        if (usersResponse.data.success && usersResponse.data.data) {
          const newUser = usersResponse.data.data.find((u: any) => u.email === newEmail.trim());
          if (newUser) {
            await api.put(`/admin/users/${newUser.id}`, { role: 'admin' });
          }
        }
      }

      // Reset form
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setNewRole('user');
      setIsAdding(false);
      await loadUsers();
      alert('Kullanıcı başarıyla eklendi');
    } catch (error: any) {
      alert(error.response?.data?.message || error.message || 'Kullanıcı eklenemedi');
    }
  };

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setEditingName(user.name);
    setEditingEmail(user.email);
    setEditingRole(user.role);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editingName.trim() || !editingEmail.trim()) {
      alert('Lütfen tüm alanları doldurun');
      return;
    }

    try {
      await api.put(`/admin/users/${editingId}`, {
        role: editingRole,
      });
      
      setEditingId(null);
      setEditingName('');
      setEditingEmail('');
      setEditingRole('user');
      await loadUsers();
      alert('Kullanıcı başarıyla güncellendi');
    } catch (error: any) {
      alert(error.response?.data?.message || error.message || 'Kullanıcı güncellenemedi');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
    setEditingEmail('');
    setEditingRole('user');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      try {
        await api.delete(`/admin/users/${id}`);
        await loadUsers();
        alert('Kullanıcı başarıyla silindi');
      } catch (error: any) {
        alert(error.response?.data?.message || error.message || 'Kullanıcı silinemedi');
      }
    }
  };

  const filteredUsers = users.filter(user => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  });

  return (
    <>
      <SEO title="Kullanıcı Yönetimi" description="Kullanıcıları yönetin" />
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                Kullanıcı Yönetimi
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">
                {users.length} kullanıcı yönetiliyor
              </p>
            </div>
            {!isAdding && (
              <Button variant="primary" onClick={() => setIsAdding(true)} className="w-full sm:w-auto">
                + Yeni Kullanıcı Ekle
              </Button>
            )}
          </div>

          {/* Search */}
          <div>
            <Input
              label="Kullanıcı Ara"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="İsim veya e-posta ile ara..."
            />
          </div>

          {/* Add Form */}
          {isAdding && (
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Yeni Kullanıcı Ekle
              </h2>
              <div className="space-y-4">
                <Input
                  label="Ad Soyad *"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Örn: Ahmet Yılmaz"
                />
                <Input
                  label="E-posta *"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="ornek@email.com"
                />
                <Input
                  label="Şifre *"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="En az 6 karakter"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rol *
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as 'user' | 'admin')}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="user">Müşteri (User)</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" onClick={handleAdd} className="flex-1 sm:flex-initial">
                    Kaydet
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAdding(false);
                      setNewName('');
                      setNewEmail('');
                      setNewPassword('');
                      setNewRole('user');
                    }}
                    className="flex-1 sm:flex-initial"
                  >
                    İptal
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Users List */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Ad Soyad
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        E-posta
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Kayıt Tarihi
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        {editingId === user.id ? (
                          <>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                              <Input
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                className="w-full text-sm"
                              />
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                              <Input
                                value={editingEmail}
                                onChange={(e) => setEditingEmail(e.target.value)}
                                className="w-full text-sm"
                                disabled
                              />
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                              <select
                                value={editingRole}
                                onChange={(e) => setEditingRole(e.target.value as 'user' | 'admin')}
                                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                              >
                                <option value="user">Müşteri</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end gap-2">
                                <Button variant="primary" size="sm" onClick={handleSaveEdit}>
                                  Kaydet
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                                  İptal
                                </Button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {user.avatar ? (
                                  <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="h-8 w-8 sm:h-10 sm:w-10 rounded-full mr-2 sm:mr-3"
                                  />
                                ) : (
                                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center mr-2 sm:mr-3">
                                    <span className="text-primary-600 dark:text-primary-400 font-semibold text-xs sm:text-sm">
                                      {user.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                                <div className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                                  {user.name}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  user.role === 'admin'
                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                }`}
                              >
                                {user.role === 'admin' ? 'Admin' : 'Müşteri'}
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(user)}
                                >
                                  ✏️ Düzenle
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleDelete(user.id)}
                                >
                                  🗑️ Sil
                                </Button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md p-8 sm:p-12 text-center">
              <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">👥</div>
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base md:text-lg">
                {searchQuery ? 'Arama sonucu bulunamadı' : 'Henüz kullanıcı eklenmemiş'}
              </p>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
};

