import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useMessageStore } from '@/store/messageStore';
import { useAppointmentStore } from '@/store/appointmentStore';
import { useNewsletterStore } from '@/store/newsletterStore';
import { userOrderService } from '@/services/userOrderService';
import { routes } from '@/config';

interface NotificationCounts {
  users: number;
  orders: number;
  messages: number;
  newsletters: number;
  appointments: number;
}

// localStorage keys for tracking "seen" items
const SEEN_MESSAGES_KEY = 'admin_seen_messages';
const SEEN_ORDERS_KEY = 'admin_seen_orders';
const SEEN_APPOINTMENTS_KEY = 'admin_seen_appointments';
const SEEN_NEWSLETTERS_KEY = 'admin_seen_newsletters';

const getSeenIds = (key: string): Set<string> => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
};

const saveSeenIds = (key: string, ids: Set<string>) => {
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(ids)));
  } catch (error) {
    console.error(`Failed to save seen IDs for ${key}:`, error);
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

  // Mark all current items as "seen" when visiting the page
  useEffect(() => {
    // Messages page - mark all unread messages as read
    if (location.pathname === routes.adminMessages) {
      const markAllAsRead = async () => {
        try {
          const unreadMessages = messages.filter(m => !m.read);
          for (const message of unreadMessages) {
            try {
              await useMessageStore.getState().markAsRead(message.id);
            } catch (error) {
              console.error(`Failed to mark message ${message.id} as read:`, error);
            }
          }
          // Also mark as seen in localStorage
          const seenIds = getSeenIds(SEEN_MESSAGES_KEY);
          messages.forEach(m => seenIds.add(m.id));
          saveSeenIds(SEEN_MESSAGES_KEY, seenIds);
        } catch (error) {
          console.error('Failed to mark all messages as read:', error);
        }
      };
      
      if (messages.length > 0) {
        markAllAsRead();
      }
    }

    // Orders page - mark current orders as seen
    if (location.pathname === routes.adminUserOrders) {
      const markOrdersAsSeen = async () => {
        try {
          const orders = await userOrderService.getOrders();
          const seenIds = getSeenIds(SEEN_ORDERS_KEY);
          if (Array.isArray(orders)) {
            orders.forEach((order: any) => seenIds.add(order.id));
            saveSeenIds(SEEN_ORDERS_KEY, seenIds);
          }
        } catch (error) {
          console.error('Failed to mark orders as seen:', error);
        }
      };
      markOrdersAsSeen();
    }

    // Appointments page - mark current appointments as seen
    if (location.pathname === routes.adminAppointments) {
      const seenIds = getSeenIds(SEEN_APPOINTMENTS_KEY);
      appointments.forEach(a => seenIds.add(a.id));
      saveSeenIds(SEEN_APPOINTMENTS_KEY, seenIds);
    }

    // Newsletters page - mark current subscriptions as seen
    if (location.pathname === routes.adminNewsletters) {
      const seenIds = getSeenIds(SEEN_NEWSLETTERS_KEY);
      subscriptions.forEach((sub: any) => seenIds.add(sub.id || sub.email));
      saveSeenIds(SEEN_NEWSLETTERS_KEY, seenIds);
    }
  }, [location.pathname, messages, appointments, subscriptions]);

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
          const seenOrderIds = getSeenIds(SEEN_ORDERS_KEY);
          const pendingOrders = Array.isArray(orders) 
            ? orders.filter((order: any) => {
                const isPending = order.status === 'pending' || order.status === 'processing';
                const isNew = !seenOrderIds.has(order.id);
                return isPending && isNew;
              })
            : [];
          setCounts(prev => ({ ...prev, orders: pendingOrders.length }));
        } catch (error) {
          console.error('Failed to load pending orders:', error);
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

  // Update counts when data changes - only count NEW items
  useEffect(() => {
    // Messages: only count unread messages that haven't been seen
    const seenMessageIds = getSeenIds(SEEN_MESSAGES_KEY);
    const newUnreadMessages = messages.filter(m => !m.read && !seenMessageIds.has(m.id));
    
    // Appointments: only count pending appointments that haven't been seen
    const seenAppointmentIds = getSeenIds(SEEN_APPOINTMENTS_KEY);
    const newPendingAppointments = appointments.filter(
      a => a.status === 'pending' && !seenAppointmentIds.has(a.id)
    );
    
    // Newsletters: only count new subscriptions that haven't been seen
    const seenNewsletterIds = getSeenIds(SEEN_NEWSLETTERS_KEY);
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const newNewsletters = subscriptions.filter((sub: any) => {
      const createdAt = new Date(sub.createdAt || sub.created_at);
      const isNew = createdAt >= yesterday;
      const isUnseen = !seenNewsletterIds.has(sub.id || sub.email);
      return isNew && isUnseen;
    }).length;

    setCounts(prev => ({
      ...prev,
      messages: newUnreadMessages.length,
      appointments: newPendingAppointments.length,
      newsletters: newNewsletters,
      users: 0, // Remove users notification completely
    }));
  }, [messages, appointments, subscriptions]);

  return counts;
};
