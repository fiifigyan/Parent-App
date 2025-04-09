import React, { useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import Card from '../components/Card';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const WelcomeScreen = () => {
    const navigation = useNavigation();
    const { userInfo } = useContext(AuthContext);
    const userName = userInfo?.name || 'User';

    const QuickActionCard = ({ iconName, title, description, onPress, color }) => (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
            <LinearGradient
                colors={['#ffffff', '#f8f9ff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.actionCard, { borderLeftWidth: 4, borderLeftColor: color }]}
            >
                <View style={styles.cardIconContainer}>
                    <Icon name={iconName} size={24} color={color} />
                </View>
                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{title}</Text>
                    <Text style={styles.cardDescription}>{description}</Text>
                </View>
                <Icon name="chevron-forward" size={20} color="#aaa" />
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header with greeting */}
            <LinearGradient
                colors={['#03C043', '#03AC13']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <Text style={styles.welcomeText}>Welcome back,</Text>
                    <Text style={styles.userName}>{userName}</Text>
                    <Text style={styles.subtitle}>Let's continue your child's educational journey</Text>
                </View>
                <Image 
                    source={require('../assets/icons/OAIS-logo.png')} 
                    style={styles.headerImage}
                />
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Quick Actions Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    
                    <QuickActionCard
                        iconName="school-outline"
                        title="Start New Enrollment"
                        description="Begin your child's admission process"
                        onPress={() => navigation.navigate('Admission')}
                        color="#4caf50"
                    />

                    <QuickActionCard
                        iconName="document-text-outline"
                        title="View Admission Status"
                        description="Check your application progress"
                        onPress={() => navigation.navigate('AdmissionStatus')}
                        color="#2196f3"
                    />

                    <QuickActionCard
                        iconName="wallet-outline"
                        title="Bill For New Admissions"
                        description="View the breakdown of your admission fees"
                        onPress={() => navigation.navigate('AdmissionBreakdown')}
                        color="#ff9800"
                    />
                </View>

                {/* Information Cards Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Important Information</Text>
                    
                    <Card style={styles.infoCard}>
                        <View style={styles.infoHeader}>
                            <Icon name="time-outline" size={20} color="#000080" />
                            <Text style={styles.infoTitle}>Admission Timeline</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <View style={styles.bulletPoint} />
                            <Text style={styles.infoText}>Applications Open: September 1, 2023</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <View style={styles.bulletPoint} />
                            <Text style={styles.infoText}>Assessment Date: October 15, 2023</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <View style={styles.bulletPoint} />
                            <Text style={styles.infoText}>Results Declaration: November 5, 2023</Text>
                        </View>
                    </Card>

                    <Card style={[styles.infoCard, { marginTop: 15 }]}>
                        <View style={styles.infoHeader}>
                            <Icon name="help-circle-outline" size={20} color="#000080" />
                            <Text style={styles.infoTitle}>Need Help?</Text>
                        </View>
                        <Text style={[styles.infoText, { marginLeft: 28 }]}>
                            Contact our admissions office at admissions@school.edu or call +1234567890
                        </Text>
                    </Card>
                </View>

                {/* Virtual Tour Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Explore Our School</Text>
                    <TouchableOpacity 
                        style={styles.tourButton}
                        onPress={() => navigation.navigate('Tour')}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#000080', '#1a237e']}
                            style={styles.tourButtonGradient}
                        >
                            <Icon name="videocam-outline" size={24} color="#fff" />
                            <Text style={styles.tourButtonText}>Take a Virtual Tour</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9ff',
    },
    scrollContent: {
        paddingBottom: 30,
    },
    header: {
        padding: 25,
        paddingBottom: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        borderBottomEndRadius: 80,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 10,
    },
    headerContent: {
        flex: 1,
    },
    headerImage: {
        width: 60,
        height: 60,
        resizeMode: 'cover',
        borderRadius: 50,
    },
    welcomeText: {
        fontSize: 20,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 5,
    },
    userName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
    },
    section: {
        padding: 20,
        paddingBottom: 0,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#000080',
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        marginBottom: 15,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 6,
        elevation: 3,
    },
    cardIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,128,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000080',
    },
    cardDescription: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    infoCard: {
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 6,
        elevation: 3,
    },
    infoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginLeft: 8,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    bulletPoint: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#000080',
        marginRight: 10,
    },
    infoText: {
        fontSize: 14,
        color: '#555',
    },
    tourButton: {
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 6,
        elevation: 5,
    },
    tourButtonGradient: {
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tourButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 10,
    },
});

export default WelcomeScreen;