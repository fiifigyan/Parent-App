import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/MaterialIcons';
/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Renders the TimetableScreen component displaying a list of scheduled classes for a selected date.
 *
 * Utilizes mock data to display classes, but can be updated to fetch data from an API.
 * The component renders a FlatList containing the details of each class, including
 * subject, time, room, and teacher information. If no classes are scheduled
 * for the selected date, an empty state view is displayed instead.
 *
 * @returns {JSX.Element} A view containing a list of classes for the selected date
 * or an empty state if no classes are scheduled.
 */

/*******  bff8036e-8073-444f-ba37-56a9fffdb377  *******/
const TimetableScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showCalendar, setShowCalendar] = useState(false);

  // Mock data - replace with API call
  const timetableData = {
    '2024-12-15': [
      { id: '1', subject: 'Mathematics', time: '8:00 AM - 9:30 AM', room: 'Room 101', teacher: 'Mr. Smith' },
      { id: '2', subject: 'Science Lab', time: '10:00 AM - 11:30 AM', room: 'Lab B', teacher: 'Dr. Johnson' },
    ],
    '2024-12-20': [
      { id: '3', subject: 'English Literature', time: '9:00 AM - 10:30 AM', room: 'Room 205', teacher: 'Ms. Williams' },
      { id: '4', subject: 'History', time: '11:00 AM - 12:30 PM', room: 'Room 103', teacher: 'Mr. Brown' },
    ],
  };

  const markedDates = {
    ...Object.keys(timetableData).reduce((acc, date) => {
      acc[date] = { marked: true, dotColor: '#03AC13' };
      return acc;
    }, {}),
    [selectedDate]: { selected: true, selectedColor: '#03AC13' }
  };

  const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

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

      {timetableData[selectedDate] ? (
        <FlatList
          data={timetableData[selectedDate]}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card}>
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{item.time.split(' - ')[0]}</Text>
                <Text style={styles.timeDivider}>to</Text>
                <Text style={styles.timeText}>{item.time.split(' - ')[1]}</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.subject}>{item.subject}</Text>
                <View style={styles.details}>
                  <View style={styles.detailItem}>
                    <Icon name="place" size={16} color="#666" />
                    <Text style={styles.detailText}>{item.room}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Icon name="person" size={16} color="#666" />
                    <Text style={styles.detailText}>{item.teacher}</Text>
                  </View>
                </View>
              </View>
              <Icon name="chevron-right" size={24} color="#03AC13" />
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.emptyState}>
          <Icon name="schedule" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No classes scheduled</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginBottom: 20,
  },
  dateText: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  calendarContainer: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    backgroundColor: '#ffffff',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timeContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#03AC13',
  },
  timeDivider: {
    fontSize: 12,
    color: '#999',
    marginVertical: 2,
  },
  cardContent: {
    flex: 1,
  },
  subject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  detailText: {
    color: '#666',
    marginLeft: 4,
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
  },
});

export default TimetableScreen;