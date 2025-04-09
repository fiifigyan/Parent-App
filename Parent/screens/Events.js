import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/Ionicons';
import EventService from '../services/EventService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EventScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentId, setStudentId] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        const storedStudentId = await AsyncStorage.getItem('selectedStudent');
        setStudentId(storedStudentId);
        await loadEvents();
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    initialize();
  }, [selectedDate]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await EventService.fetchEventsByDate(selectedDate);
      setEvents(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    if (!studentId) {
      Alert.alert('Error', 'No student selected');
      return;
    }

    try {
      const updatedEvent = await EventService.registerForEvent(eventId, studentId);
      setEvents(events.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      ));
      Alert.alert('Success', 'Registration successful!');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to register for event');
    }
  };

  const markedDates = {
    [selectedDate]: { selected: true, selectedColor: '#03AC13' }
  };

  const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#03AC13" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading events: {error}</Text>
        <TouchableOpacity onPress={loadEvents} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.dateSelector}
        onPress={() => setShowCalendar(!showCalendar)}
      >
        <Icon name="calendar-today" size={20} color="#03AC13" />
        <Text style={styles.dateText}>{formattedDate}</Text>
        <Icon name={showCalendar ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={24} color="#03AC13" />
      </TouchableOpacity>

      {showCalendar && (
        <View style={styles.calendarContainer}>
          <Calendar
            markedDates={markedDates}
            onDayPress={(day) => {
              setSelectedDate(day.dateString);
              setShowCalendar(false);
            }}
            theme={{
              todayTextColor: '#03AC13',
              arrowColor: '#03AC13',
              selectedDayBackgroundColor: '#03AC13',
              selectedDayTextColor: '#ffffff',
            }}
          />
        </View>
      )}

      {events.length > 0 ? (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.eventCard}>
              <Image 
                source={{ uri: item.image }} 
                style={styles.eventImage}
                resizeMode="cover"
              />
              <View style={styles.eventContent}>
                <Text style={styles.eventTitle}>{item.title}</Text>
                <View style={styles.eventDetails}>
                  <View style={styles.detailItem}>
                    <Icon name="calendar" size={16} color="#03AC13" />
                    <Text style={styles.detailText}>{item.date} • {item.time}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Icon name="location" size={16} color="#03AC13" />
                    <Text style={styles.detailText}>{item.location}</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={[
                    styles.registerButton,
                    item.registered && { backgroundColor: '#4CAF50' }
                  ]} 
                  onPress={() => handleRegister(item.id)}
                  disabled={item.registered}
                >
                  <Text style={styles.buttonText}>
                    {item.registered ? 'Registered' : 'Register'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      ) : (
        <View style={styles.emptyState}>
          <Icon name="event-busy" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No events scheduled</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    margin: 16,
  },
  dateText: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  calendarContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    backgroundColor: '#ffffff',
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eventImage: {
    width: '100%',
    height: 150,
  },
  eventContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  eventDetails: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  registerButton: {
    backgroundColor: '#03AC13',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#03AC13',
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
  },
});

export default EventScreen;