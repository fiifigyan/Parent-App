import React,{useContext} from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { StudentContext } from '../context/StudentContext';

const CustomHeader = ({ title = 'Dashboard', navigation }) => {
  const { studentInfo } = useContext(StudentContext);
  const selectedStudent = studentInfo[0];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, justifyContent: 'space-between', backgroundColor: 'aliceblue' }}>
      <TouchableOpacity onPress={() => navigation.openDrawer()}>
        <Icon name="menu-outline" size={24} color="#03AC13" />
      </TouchableOpacity>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#03AC13' }}>{title}</Text>
      <TouchableOpacity onPress={() => navigation.navigate('Student')}>
        <Image
          source={{ uri: selectedStudent?.profileImage || require('../assets/images/fiifi1.jpg') }}
          style={{ width: 30, height: 30, borderRadius: 50, borderWidth: 1, borderColor: 'grey' }}
        />
      </TouchableOpacity>
    </View>
  );
};

export default CustomHeader;