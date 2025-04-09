import { API_CONFIG } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EVENTS_API_URL = `${API_CONFIG.BASE_URL}${API_CONFIG.EVENT_ENDPOINTS.BASE}`;

export const EventService = {
  /**
   * Get auth token from AsyncStorage
   * @returns {Promise<string>} Auth token
   */
  getAuthToken: async () => {
    try {
      return await AsyncStorage.getItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  },

  /**
   * Fetch all events
   * @returns {Promise<Array>} Array of events
   */
  fetchAllEvents: async () => {
    try {
      const token = await EventService.getAuthToken();
      const response = await fetch(EVENTS_API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        timeout: API_CONFIG.REQUEST_TIMEOUT
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  /**
   * Fetch event by ID
   * @param {string} id - Event ID
   * @returns {Promise<Object>} Event object
   */
  fetchEventById: async (id) => {
    try {
      const token = await EventService.getAuthToken();
      const response = await fetch(`${EVENTS_API_URL}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        timeout: API_CONFIG.REQUEST_TIMEOUT
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching event ${id}:`, error);
      throw error;
    }
  },

  /**
   * Fetch events by date
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<Array>} Array of events for the specified date
   */
  fetchEventsByDate: async (date) => {
    try {
      const token = await EventService.getAuthToken();
      const response = await fetch(`${EVENTS_API_URL}?date=${date}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        timeout: API_CONFIG.REQUEST_TIMEOUT
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching events for date ${date}:`, error);
      throw error;
    }
  },

  /**
   * Register for an event
   * @param {string} eventId - Event ID
   * @param {string} studentId - Student ID
   * @returns {Promise<Object>} Updated event object
   */
  registerForEvent: async (eventId, studentId) => {
    try {
      const token = await EventService.getAuthToken();
      const response = await fetch(`${EVENTS_API_URL}/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId,
          registeredAt: new Date().toISOString()
        }),
        timeout: API_CONFIG.REQUEST_TIMEOUT
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error registering for event:', error);
      throw error;
    }
  },

  /**
   * Cancel event registration
   * @param {string} eventId - Event ID
   * @param {string} studentId - Student ID
   * @returns {Promise<Object>} Updated event object
   */
  cancelRegistration: async (eventId, studentId) => {
    try {
      const token = await EventService.getAuthToken();
      const response = await fetch(`${EVENTS_API_URL}/${eventId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ studentId }),
        timeout: API_CONFIG.REQUEST_TIMEOUT
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error canceling event registration:', error);
      throw error;
    }
  }
};

export default EventService;