import { View, Text, Button, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import React, { useState } from 'react';
import Splash from '../button/Splash';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Maps, Search, Chat, Profil } from '../button';
import BottomNav from '../components/BottomNav';
import Icon from 'react-native-vector-icons/FontAwesome';
import Mengikuti from '../components/Mengikuti';
import EditProfil from '../components/EditProfil';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainApp = ({ navigation }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [isProfileModalVisible, setProfileModalVisible] = useState(false);

  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  const openProfileModal = () => setProfileModalVisible(true);
  const closeProfileModal = () => setProfileModalVisible(false);

  const handleNavigateToMengikuti = () => {
    closeModal();
    navigation.navigate('Mengikuti');
  };

  const handleNavigateToEditProfil = () => {
    closeProfileModal();
    navigation.navigate('EditProfil');
  };

  return (
    <>
      <Tab.Navigator tabBar={(props) => <BottomNav {...props} />}> 
        <Tab.Screen
          name="Home"
          component={Home}
          options={{
            headerLeft: () => (
              <Image
                source={require('../assets/F!ND.png')}
                style={{ width: 60, height: 60, resizeMode: 'contain' }}
              />
            ),
            headerTitle: 'F1ND',
            headerRight: () => (
              <TouchableOpacity
                onPress={openModal}
                style={styles.iconContainer}>
                <Icon name="ellipsis-v" size={24} color="#333" />
              </TouchableOpacity>
            ),
          }}
        />
        <Tab.Screen
          name="Maps"
          component={Maps}
          options={{
            headerLeft: () => (
              <Image
                source={require('../assets/F!ND.png')}
                style={{ width: 60, height: 60, resizeMode: 'contain' }}
              />
            ),
            headerTitle: '',
            headerRight: () => (
              <TouchableOpacity onPress={() => console.log("More options pressed")} style={styles.iconContainer}>
                <Icon name="ellipsis-v" size={24} color="#333" />
              </TouchableOpacity>
            ),
          }}
        />
        <Tab.Screen
          name="Search"
          component={Search}
          options={{
            headerLeft: () => (
              <Image
                source={require('../assets/F!ND.png')}
                style={{ width: 60, height: 60, resizeMode: 'contain' }}
              />
            ),
            headerTitle: '',
            headerRight: () => (
              <TouchableOpacity onPress={() => console.log("More options pressed")} style={styles.iconContainer}>
                <Icon name="ellipsis-v" size={24} color="#333" />
              </TouchableOpacity>
            ),
          }}
        />
        <Tab.Screen
          name="Chat"
          component={Chat}
          options={{
            headerLeft: () => (
              <Image
                source={require('../assets/F!ND.png')}
                style={{ width: 60, height: 60, resizeMode: 'contain' }}
              />
            ),
            headerTitle: '  Pesan',
            headerRight: () => (
              <TouchableOpacity onPress={() => console.log("More options pressed")} style={styles.iconContainer}>
                <Icon name="ellipsis-v" size={24} color="#333" />
              </TouchableOpacity>
            ),
          }}
        />
        <Tab.Screen
          name="Profil"
          component={Profil}
          options={{
            headerLeft: () => (
              <Image
                source={require('../assets/F!ND.png')}
                style={{ width: 60, height: 60, resizeMode: 'contain' }}
              />
            ),
            headerTitle: '',
            headerRight: () => (
              <TouchableOpacity onPress={openProfileModal} style={styles.iconContainer}>
                <Icon name="ellipsis-v" size={24} color="#333" />
              </TouchableOpacity>
            ),
          }}
        />
      </Tab.Navigator>

      {/* Modal for Options */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalTopContentRight}>
            <TouchableOpacity onPress={handleNavigateToMengikuti}>
              <Text style={styles.modalOption}>Mengikuti</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={closeModal}>
              <Text style={styles.modalCancel}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal for Profile Options */}
      <Modal
        visible={isProfileModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeProfileModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalTopContentRight}>
            <TouchableOpacity onPress={handleNavigateToEditProfil}>
              <Text style={styles.modalOption}>Edit Profil</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={closeProfileModal}>
              <Text style={styles.modalCancel}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const Router = () => {
  return (
    <Stack.Navigator initialRouteName="Splash">
      <Stack.Screen name="mainApp" component={MainApp} options={{ headerShown: false }} />
      <Stack.Screen name="Splash" component={Splash} options={{ headerShown: false }} />
      <Stack.Screen
        name="Mengikuti"
        component={Mengikuti}
        options={{
          headerTitle: 'Postingan yang Diikuti',
        }}
      />
      <Stack.Screen
        name="EditProfil"
        component={EditProfil}
        options={{
          headerTitle: 'Edit Profil',
        }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    marginRight: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalTopContentRight: {
    position: 'absolute',
    top: 50,
    right: 10,
    width: 150,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
    alignItems: 'flex-start',
    elevation: 5,
  },
  modalOption: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  modalCancel: {
    fontSize: 14,
    color: 'red',
  },
});

export default Router;
