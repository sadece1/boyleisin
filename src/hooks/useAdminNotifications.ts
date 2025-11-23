import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useMessageStore } from '@/store/messageStore';
import { useAppointmentStore } from '@/store/appointmentStore';
import { useNewsletterStore } from '@/store/newsletterStore';
import { userOrderService } from '@/services/userOrderService';
import { authService } from '@/services/authService';
import { routes } from '@/config';

interface NotificationCounts {
  users: number;
  orders: number;
  messages: number;
  newsletters: number;
  appointments: number;
}

// localStorage keys for tracking "last seen" timestamps
const LAST_SEEN_MESSAGES_KEY = 'admin_last_seen_messages';
const LAST_SEEN_ORDERS_KEY = 'admin_last_seen_orders';
const LAST_SEEN_APPOINTMENTS_KEY = 'admin_last_seen_appointments';
const LAST_SEEN_NEWSLETTERS_KEY = 'admin_last_seen_newsletters';
const LAST_SEEN_USERS_KEY = 'admin_last_seen_users';

const getLastSeen = (key: string): number => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? parseInt(stored, 10) : 0;
  } catch {
    return 0;
  }
};

const setLastSeen = (key: string, timestamp: number) => {
  try {
    localStorage.setItem(key, String(timestamp));
  } catch (error) {
    console.error(`Failed to save last seen for ${key}:`, error);
  }
};

export const useAdminNotifications = () => {
  const location = useLocation();
  const { messages, fetchMessages } = useMessageStore();
  const { appointments, fetchAppointments } = useAppointmentStore();
  const { subscriptions, fetchSubscriptions } = useNewsletterStore();
  const [counts, setCounts] = useState<NotificationCounts>({
    users: 0,
    orders: 0,
    messages: 0,
    newsletters: 0,
    appointments: 0,
  });

  // Mark notifications as seen when user visits the page
  useEffect(() => {
    const now = Date.now();
    
    // Mark messages as seen when visiting messages page
    if (location.pathname === routes.adminMessages || location.pathname.startsWith(routes.adminMessages)) {
      setLastSeen(LAST_SEEN_MESSAGES_KEY, now);
    }
    
    // Mark orders as seen when visiting orders page
    if (location.pathname === routes.adminUserOrders || location.pathname.startsWith(routes.adminUserOrders)) {
      setLastSeen(LAST_SEEN_ORDERS_KEY, now);
    }
    
    // Mark appointments as seen when visiting appointments page
    if (location.pathname === routes.adminAppointments || location.pathname.startsWith(routes.adminAppointments)) {
      setLastSeen(LAST_SEEN_APPOINTMENTS_KEY, now);
    }
    
    // Mark newsletters as seen when visiting newsletters page
    if (location.pathname === routes.adminNewsletters || location.pathname.startsWith(routes.adminNewsletters)) {
      setLastSeen(LAST_SEEN_NEWSLETTERS_KEY, now);
    }
    
    // Mark users as seen when visiting users page
    if (location.pathname === routes.adminUsers || location.pathname.startsWith(routes.adminUsers)) {
      setLastSeen(LAST_SEEN_USERS_KEY, now);
    }
  }, [location.pathname]);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        // Load messages to get unread count
        await fetchMessages(1);
        
        // Load appointments to get pending count
        await fetchAppointments(1);
        
        // Load newsletters to get new subscriptions
        await fetchSubscriptions(1);
        
        // Load pending orders
        try {
          const orders = await userOrderService.getOrders();
          const pendingOrders = Array.isArray(orders) 
            ? orders.filter((order: any) => order.status === 'pending' || order.status === 'processing')
            : [];
          
          // Count only orders created after last seen
          const lastSeenOrders = getLastSeen(LAST_SEEN_ORDERS_KEY);
          const newOrders = pendingOrders.filter((order: any) => {
            const createdAt = new Date(order.createdAt || order.created_at).getTime();
            return createdAt > lastSeenOrders;
          });
          
          setCounts(prev => ({ ...prev, orders: newOrders.length }));
        } catch (error) {
          console.error('Failed to load pending orders:', error);
        }
        
        // Load new users
        try {
          const users = await authService.getAllUsers();
          const lastSeenUsers = getLastSeen(LAST_SEEN_USERS_KEY);
          const newUsers = Array.isArray(users) 
            ? users.filter((user: any) => {
                const createdAt = new Date(user.createdAt || user.created_at).getTime();
                return createdAt > lastSeenUsers;
              })
            : [];
          setCounts(prev => ({ ...prev, users: newUsers.length }));
        } catch (error) {
          console.error('Failed to load new users:', error);
        }
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    };

    loadNotifications();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [fetchMessages, fetchAppointments, fetchSubscriptions]);

  // Update counts when data changes, checking against last seen timestamps
  useEffect(() => {
    const lastSeenMessages = getLastSeen(LAST_SEEN_MESSAGES_KEY);
    const lastSeenAppointments = getLastSeen(LAST_SEEN_APPOINTMENTS_KEY);
    const lastSeenNewsletters = getLastSeen(LAST_SEEN_NEWSLETTERS_KEY);
    
    // Count only unread messages created after last seen
    const newUnreadMessages = messages.filter(m => {
      if (m.read) return false;
      const createdAt = new Date(m.createdAt || m.created_at).getTime();
      return createdAt > lastSeenMessages;
    });
    
    // Count only pending appointments created after last seen
    const newPendingAppointments = appointments.filter(a => {
      if (a.status !== 'pending') return false;
      const createdAt = new Date(a.createdAt || a.created_at).getTime();
      return createdAt > lastSeenAppointments;
    });
    
    // Count only new newsletters created after last seen
    const newNewsletters = subscriptions.filter((sub: any) => {
      const createdAt = new Date(sub.createdAt || sub.created_at).getTime();
      return createdAt > lastSeenNewsletters;
    });

    setCounts(prev => ({
      ...prev,
      messages: newUnreadMessages.length,
      appointments: newPendingAppointments.length,
      newsletters: newNewsletters.length,
    }));
  }, [messages, appointments, subscriptions]);

  return counts;
};
