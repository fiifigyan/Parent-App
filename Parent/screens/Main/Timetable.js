import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl, 
  FlatList 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { CalendarService } from '../../services/CalendarService';
import { useProfile } from '../../context/ProfileContext';
import { sanitizeError } from '../../utils/helpers';

const TimetableScreen = () => {
  const { selectedStudent } = useProfile();
  const [timetableData, setTimetableData] = useState({});
  const [currentDay, setCurrentDay] = useState(new Date().getDay());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const days = [
    { id: 1, name: 'Monday' },
    { id: 2, name: 'Tuesday' },
    { id: 3, name: 'Wednesday' },
    { id: 4, name: 'Thursday' },
    { id: 5, name: 'Friday' },
  ];

  const loadTimetable = async () => {
    try {
      if (!selectedStudent?.id) return;
      
      setError(null);
      setLoading(true);
      const data = await CalendarService.fetchTimetable(selectedStudent.id);
      setTimetableData(data || {});
    } catch (error) {
      const friendlyError = sanitizeError(error);
      console.error('Error loading timetable:', friendlyError);
      setError(friendlyError);
      setTimetableData({});
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTimetable();
  }, [selectedStudent]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadTimetable();
  };

  const handleDayChange = (dayId) => {
    setCurrentDay(dayId);
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00873E" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Icon name="error" size={48} color="#FF5722" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={handleRefresh}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const currentDayData = timetableData[days[currentDay-1]?.name] || [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Horizontal day selector - now using FlatList instead of ScrollView */}
      <FlatList
        horizontal
        data={days}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleDayChange(item.id)}>
            <LinearGradient
              colors={currentDay === item.id ? ['#00873E', '#4CAF50'] : ['#ffffff', '#f5f5f5']}
              style={[styles.dayTab, currentDay === item.id && styles.activeDayTab]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
            >
              <Text style={[styles.dayText, currentDay === item.id && styles.activeDayText]}>
                {item.name}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.daySelector}
        showsHorizontalScrollIndicator={false}
      />

      {/* Main content FlatList */}
      <FlatList
        data={currentDayData}
        contentContainerStyle={styles.content}
        keyExtractor={(item, index) => `${index}_${item.time}`}
        renderItem={({ item }) => (
          <View style={styles.classCard}>
            <View style={styles.classTimeContainer}>
              <Text style={styles.classTime}>{item.time}</Text>
            </View>
            <View style={styles.classDetails}>
              <Text style={styles.classSubject}>{item.subject}</Text>
              <View style={styles.classMeta}>
                <Icon name="person" size={14} color="#666" />
                <Text style={styles.classTeacher}>{item.teacher}</Text>
                <Icon name="room" size={14} color="#666" style={styles.roomIcon} />
                <Text style={styles.classRoom}>{item.room}</Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="event-busy" size={48} color="#cccccc" />
            <Text style={styles.emptyText}>No classes scheduled</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#00873E']}
            tintColor="#00873E"
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    fontSize: 16,
    color: '#FF5722',
    marginVertical: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: '#00873E',
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  daySelector: {
    padding: 5,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayTab: {
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activeDayTab: {
    shadowColor: '#00873E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  dayText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  activeDayText: {
    color: '#ffffff',
  },
  content: {
    padding: 15,
    flexGrow: 1,
  },
  classCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  classTimeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  classTime: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00873E',
  },
  classDetails: {
    flex: 1,
  },
  classSubject: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  classMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  classTeacher: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    marginRight: 12,
  },
  roomIcon: {
    marginLeft: 8,
  },
  classRoom: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
});

export default TimetableScreen;