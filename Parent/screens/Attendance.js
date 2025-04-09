import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { PieChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AttendanceScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showCalendar, setShowCalendar] = useState(false);

  // Mock data - replace with API call
  const attendanceData = {
    '2024-12-15': { present: 25, absent: 2 },
    '2024-12-20': { present: 22, absent: 5 },
  };

  const currentData = attendanceData[selectedDate];
  const totalStudents = currentData ? currentData.present + currentData.absent : 0;
  const attendanceRate = currentData ? Math.round((currentData.present / totalStudents) * 100) : 0;

  const markedDates = {
    ...Object.keys(attendanceData).reduce((acc, date) => {
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

      {currentData ? (
        <>
          <View style={styles.chartContainer}>
            <PieChart
              data={[
                { name: 'Present', count: currentData.present, color: '#4CAF50' },
                { name: 'Absent', count: currentData.absent, color: '#F44336' },
              ]}
              width={300}
              height={200}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="count"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Icon name="check-circle" size={24} color="#4CAF50" />
              <Text style={styles.statNumber}>{currentData.present}</Text>
              <Text style={styles.statLabel}>Present</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="cancel" size={24} color="#F44336" />
              <Text style={[styles.statNumber, { color: '#F44336' }]}>{currentData.absent}</Text>
              <Text style={styles.statLabel}>Absent</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="trending-up" size={24} color="#03AC13" />
              <Text style={styles.statNumber}>{attendanceRate}%</Text>
              <Text style={styles.statLabel}>Attendance Rate</Text>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.emptyState}>
          <Icon name="event-busy" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No attendance data for this date</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
  chartContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    width: '30%',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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

export default AttendanceScreen;