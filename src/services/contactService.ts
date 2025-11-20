import api from './api';
import { ContactForm, AppointmentForm, Message, Appointment } from '@/types';
import { mockMessages } from './messageService';
import { mockAppointments } from './appointmentService';

// Re-export storage functions from services (need to make them exported)
// For now, we'll implement them here
const MESSAGES_STORAGE_KEY = 'camp_messages_storage';
const APPOINTMENTS_STORAGE_KEY = 'camp_appointments_storage';

const loadMessages = (): Message[] => {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(MESSAGES_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    }
  } catch (error) {
    console.error('Failed to load messages from storage:', error);
  }
  return [];
};

const saveMessages = (messages: Message[]) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
    }
  } catch (error) {
    console.error('Failed to save messages to storage:', error);
  }
};

const loadAppointments = (): Appointment[] => {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    }
  } catch (error) {
    console.error('Failed to load appointments from storage:', error);
  }
  return [];
};

const saveAppointments = (appointments: Appointment[]) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments));
    }
  } catch (error) {
    console.error('Failed to save appointments to storage:', error);
  }
};

export const contactService = {
  async sendMessage(data: ContactForm): Promise<void> {
    try {
      await api.post('/contact', data);
    } catch (error) {
      // Fallback: save to mock data and localStorage
      const newMessage: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...data,
        read: false,
        createdAt: new Date().toISOString(),
      };
      
      // Load existing messages
      const messages = loadMessages();
      messages.unshift(newMessage);
      
      // Save to localStorage
      saveMessages(messages);
      
      // Update mock array
      mockMessages.length = 0;
      mockMessages.push(...messages);
    }
  },
  async bookAppointment(data: AppointmentForm): Promise<void> {
    try {
      await api.post('/appointments', data);
    } catch (error) {
      // Fallback: save to mock data and localStorage
      const newAppointment: Appointment = {
        id: `appt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...data,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      
      // Load existing appointments
      const appointments = loadAppointments();
      appointments.unshift(newAppointment);
      
      // Save to localStorage
      saveAppointments(appointments);
      
      // Update mock array
      mockAppointments.length = 0;
      mockAppointments.push(...appointments);
    }
  },
};

