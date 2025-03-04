import { View, Text, Button, Image, TouchableOpacity, StyleSheet, Modal, TouchableWithoutFeedback } from 'react-native';
import React, { useState,  useEffect } from 'react';
import Splash from '../button/Splash';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Maps, Search, Chat, Profil } from '../button';
import Komen from '../components/komen';
import BottomNav from '../components/BottomNav';
import Icon from 'react-native-vector-icons/FontAwesome';
import Mengikuti from '../components/Mengikuti';
import EditProfil from '../components/EditProfil';
import Login from '../pages/Login';
import CreateAccount from '../pages/CreateAccount';
import Find from '../Find';
import Forget from '../components/ForgetPassword/Email'
import Phone from '../components/ForgetPassword/Telepon'
import Verif1 from '../components/ForgetPassword/VerifEmail'
import Verif2 from '../components/ForgetPassword/VerifTelepon'
import NewPassword from '../components/ForgetPassword/NewPassword';
import Join from '../pages/Join'
import PremiumScreen from '../components/Premium';
import { useAuth } from '../../context/AuthContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainApp = ({ navigation }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [isProfileModalVisible, setProfileModalVisible] = useState(false);
  const {user, token, logout} = useAuth(); // Tambahkan fungsi logout

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

  const handleLogout = () => {
    closeProfileModal();
    logout(navigation);
  };

  /*React.useEffect(() => {
      if (!token || !user) {
        navigation.navigate('Login');
      }
    }, [token, user, navigation]);*/
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
              <TouchableOpacity onPress={openModal} style={styles.iconContainer}>
                <Icon name="ellipsis-v" size={24} color="#333" />
              </TouchableOpacity>
            ),
          }}
        />
        <Tab.Screen name="Maps" component={Maps} options={{ headerTitle: 'Maps', headerShown: false }} />
        <Tab.Screen name="Search" component={Search} options={{ headerTitle: 'Search' }} />
        <Tab.Screen name="Chat" component={Chat} options={{ headerTitle: 'Pesan', headerShown: false }} />
        <Tab.Screen
          name="Profil"
          component={Profil}
          options={{
            headerTitle: 'Profil',
            headerRight: () => (
              <TouchableOpacity onPress={openProfileModal} style={styles.iconContainer}>
                <Icon name="ellipsis-v" size={24} color="#333" />
              </TouchableOpacity>
            ),
          }}
        />
      </Tab.Navigator>

      {/* Beranda */}
      <Modal visible={isModalVisible} transparent={true} animationType="fade" onRequestClose={closeModal}>
        <TouchableWithoutFeedback onPress={closeModal} accessible={false}>
        <View style={styles.modalOverlay} >
          <TouchableWithoutFeedback>
          <View style={styles.modalTopContentRight}>
            <TouchableOpacity style={{flex: 1, marginBottom:'auto', size: 'auto'}} onPress={handleNavigateToMengikuti}>
              <Text style={styles.modalOption}>Mengikuti</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{flex: 1, marginBottom:'auto', size: 'auto'}} onPress={() => navigation.navigate('Premium')}>
              <Text style={styles.modalOption}>Premium</Text>
            </TouchableOpacity>
           
          </View>
          </TouchableWithoutFeedback>
        </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/*  profil */}
      <Modal visible={isProfileModalVisible} transparent={true} animationType="fade" onRequestClose={closeProfileModal}>
      <TouchableWithoutFeedback onPress={closeProfileModal} accessible={false}>
        <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback>
          <View style={styles.modalTopContentRight}>
            <TouchableOpacity style={{flex: 1, marginBottom:'auto', size: 'auto'}} onPress={handleNavigateToEditProfil}>
              <Text style={styles.modalOption}>Edit Profil</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{flex: 1, marginBottom:'auto', size: 'auto'}} onPress={handleLogout}>
              <Text style={styles.modalLogout}>Keluar</Text>
            </TouchableOpacity>
          </View>
          </TouchableWithoutFeedback>
        </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}; 

const Router = () => {
  const { user, token, loading } = useAuth();
  if (loading) {
    return null;
  }
  
  return (
    <Stack.Navigator initialRouteName={user && token ? 'mainApp' : 'Splash'}>
      <Stack.Screen name="mainApp" component={MainApp} options={{ headerShown: false }} />
      <Stack.Screen name="Splash" component={Splash} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
      <Stack.Screen name="Find" component={Find} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={CreateAccount} options={{ headerShown: false }} />
      <Stack.Screen name="Mengikuti" component={Mengikuti} options={{ headerTitle: 'Postingan yang Diikuti' }} />
      <Stack.Screen name="EditProfil" component={EditProfil} options={{ headerTitle: 'Edit Profil' }} />
      <Stack.Screen name="SearchAccount" component={Forget} options={{ headerShown: false}} />
      <Stack.Screen name="Telepon" component={Phone} options={{ headerShown: false}} />
      <Stack.Screen name="VerifEmail" component={Verif1} options={{ headerShown: false}} />
      <Stack.Screen name="VerifTelepon" component={Verif2} options={{ headerShown: false}} />
      <Stack.Screen name="NewPassword" component={NewPassword} options={{ headerShown: false}} />
      <Stack.Screen name="Comment" component={Komen} options={{ headerShown: false}} />
      <Stack.Screen name="Join" component={Join} options={{ headerTitle: '' }} />
      <Stack.Screen name="Premium" component={PremiumScreen} options={{ headerTitle: 'Get Premium',   headerTintColor: 'white', headerStyle: { backgroundColor: 'black' },}} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    marginRight: 25,
    size: 36,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalTopContentRight: {
    position: 'absolute',
    top: 50,
    right: 10,
    width: 200,
    padding: 8,
    flexDirection: 'column',
    backgroundColor: '#fff',
    borderRadius: 4,
    alignContent: 'center',
    elevation: 5,
  },
  modalOption: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  modalLogout: {
    fontSize: 16,
    color: 'red',
    marginBottom: 10,
  },
});

export default Router;