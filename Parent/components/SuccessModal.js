import React, { useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  Animated,
  Dimensions 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const SuccessModal = ({ 
  visible, 
  onClose, 
  title = "Success!", 
  message = "Action completed successfully.",
  iconName = "checkmark-circle",
  iconColor = "#4CAF50",
  autoDismiss = 3000 
}) => {
  const scaleValue = new Animated.Value(0);
  const windowWidth = Dimensions.get('window').width;

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();

      // Auto-dismiss
      const timer = setTimeout(() => {
        onClose();
      }, autoDismiss);
      return () => clearTimeout(timer);
    } else {
      scaleValue.setValue(0);
    }
  }, [visible]);

  return (
    <Modal 
      visible={visible} 
      transparent={true}
      animationType="fade"
    >
      <View style={styles.centeredView}>
        <Animated.View style={[
          styles.modalView,
          { 
            transform: [{ scale: scaleValue }],
            maxWidth: windowWidth * 0.85 
          }
        ]}>
          <View style={styles.iconContainer}>
            <Icon 
              name={iconName} 
              size={60} 
              color={iconColor} 
            />
          </View>
          
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 10,
    color: '#2c3e50',
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    marginBottom: 25,
    textAlign: 'center',
    color: '#666',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 50,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SuccessModal;