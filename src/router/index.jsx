import {
  View,
  Text,
  Button,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import Splash from '../button/Splash';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Maps, Post, Chat, Profil, KomunitasScreen } from '../button';
import Komen from '../components/komen';
import BottomNav from '../components/BottomNav';
import Icon from 'react-native-vector-icons/FontAwesome';
import Mengikuti from '../components/Mengikuti';
import EditProfil from '../components/EditProfil';
import Login from '../pages/Login';
import CreateAccount from '../pages/CreateAccount';
import Find from '../Find';
import Forget from '../components/ForgetPassword/Email';
import Phone from '../components/ForgetPassword/Telepon';
import Verif1 from '../components/ForgetPassword/VerifEmail';
import Verif2 from '../components/ForgetPassword/VerifTelepon';
import NewPassword from '../components/ForgetPassword/NewPassword';
import Join from '../pages/Join';
import NotificationScreen from '../components/Notifikasi';
import PremiumScreen from '../components/Premium';
import { useAuth } from '../../context/AuthContext';
import ExploreScreen from '../button/Search';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainApp = ({ navigation }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [isProfileModalVisible, setProfileModalVisible] = useState(false);
  const [isFModalVisible, setIsFModalVisible] = useState(false);
  const { user, token, logout } = useAuth();

  const profileButtonRef = useRef(null);
  const [profileModalPosition, setProfileModalPosition] = useState({ top: 50, left: 0 });

  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);
  const openFindModal = () => setIsFModalVisible(true);
  const closeFindModal = () => setIsFModalVisible(false);

  const openProfileModal = () => {
    if (profileButtonRef.current) {
      profileButtonRef.current.measureInWindow((x, y, width, height) => {
        setProfileModalPosition({ top: y + height, left: x - 160 });
        setProfileModalVisible(true);
      });
    } else {
      setProfileModalVisible(true);
    }
  };

  const closeProfileModal = () => setProfileModalVisible(false);

  const handleNavigateToMengikuti = () => {
    closeFindModal();
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

  useEffect(() => {
    if (!token || !user) {
      navigation.replace('Login');
    }
  }, [token, user, navigation]);

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
            headerTitle: () => (
              <TouchableOpacity
                onPress={openFindModal}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}
              >
                <Text style={styles.headerTitleText}>F1ND</Text>
                <View style={styles.dropdownIndicator}>
                  <Icon name={isFModalVisible ? 'chevron-up' : 'chevron-down'} size={15} color="black" />
                </View>
              </TouchableOpacity>
            ),
            headerRight: () => (
              <View style={styles.headerIcons}>
                <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                  <Icon name="search" size={26} color="#333" style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Notifikasi')}>
                  <Icon name="bell" size={24} color="#808080" />
                </TouchableOpacity>
              </View>
            ),
          }}
        />
        <Tab.Screen name="Maps" component={Maps} options={{ headerShown: false }} />
        <Tab.Screen name="KomunitasScreen" component={KomunitasScreen} options={{ headerShown: false }} />
        <Tab.Screen
          name="Chat"
          component={Chat}
          options={{
            headerShown: false,
            headerRight: () => (
              <View style={styles.headerIconsChat}>
                <TouchableOpacity onPress={() => navigation.navigate('Notifikasi')}>
                  <Icon name="bell" size={24} color="#808080" style={styles.iconChat} />
                </TouchableOpacity>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Profil"
          component={Profil}
          options={{
            headerTitle: 'Profil',
            headerRight: () => (
              <View style={styles.headerIcons}>
                <TouchableOpacity onPress={() => navigation.navigate('Notifikasi')}>
                  <Icon name="bell" size={24} color="#808080" style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={openProfileModal} ref={profileButtonRef}>
                  <Icon name="ellipsis-v" size={24} color="#333" />
                </TouchableOpacity>
              </View>
            ),
          }}
        />
      </Tab.Navigator>

      {/* Modal F1ND */}
      <Modal visible={isFModalVisible} transparent={true} animationType="fade" onRequestClose={closeFindModal}>
        <TouchableWithoutFeedback onPress={closeFindModal} accessible={false}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalTopCenter}>
                <TouchableOpacity onPress={handleNavigateToMengikuti}>
                  <Text style={styles.modalOption}>Mengikuti</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Premium')}>
                  <Text style={styles.modalOption}>Premium</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal Profil */}
      <Modal visible={isProfileModalVisible} transparent={true} animationType="fade" onRequestClose={closeProfileModal}>
        <TouchableWithoutFeedback onPress={closeProfileModal} accessible={false}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalTopContentRight, { top: profileModalPosition.top, left: profileModalPosition.left }]}>
                <TouchableOpacity onPress={() => navigation.navigate('Premium')}>
                  <Text style={styles.modalOption}>Premium</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleNavigateToEditProfil}>
                  <Text style={styles.modalOption}>Edit Profil</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleLogout}>
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
  if (loading) return null;

  return (
    <Stack.Navigator>
      {token && user ? (
        <Stack.Screen name="MainApp" component={MainApp} options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
      )}
      <Stack.Screen name="Splash" component={Splash} options={{ headerShown: false }} />
      <Stack.Screen name="Find" component={Find} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={CreateAccount} options={{ headerShown: false }} />
      <Stack.Screen name="Mengikuti" component={Mengikuti} options={{ headerTitle: 'Postingan yang Diikuti' }} />
      <Stack.Screen name="EditProfil" component={EditProfil} options={{ headerTitle: 'Edit Profil' }} />
      <Stack.Screen name="SearchAccount" component={Forget} options={{ headerShown: false }} />
      <Stack.Screen name="Telepon" component={Phone} options={{ headerShown: false }} />
      <Stack.Screen name="VerifEmail" component={Verif1} options={{ headerShown: false }} />
      <Stack.Screen name="VerifTelepon" component={Verif2} options={{ headerShown: false }} />
      <Stack.Screen name="NewPassword" component={NewPassword} options={{ headerShown: false }} />
      <Stack.Screen name="Comment" component={Komen} options={{ headerShown: false }} />
      <Stack.Screen name="Join" component={Join} options={{ headerShown: false }} />
      <Stack.Screen name="Premium" component={PremiumScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Notifikasi" component={NotificationScreen} options={{ headerTitle: 'Notifikasi' }} />
      <Stack.Screen name="Search" component={ExploreScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Post" component={Post} options={{ headerShown: false }} />
      <Stack.Screen name="KomunitasScreen" component={KomunitasScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  headerTitleText: {
    fontSize: 20,
    color: '#000',
    marginRight: 5,
  },
  dropdownIndicator: {
    width: 15,
    height: 15,
    alignContent: 'center',
  },
  headerIconsChat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 5,
  },
  iconChat: {
    marginRight: 10,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 25,
  },
  icon: {
    marginRight: 35,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalTopCenter: {
    position: 'absolute',
    top: 60,
    left: '50%',
    transform: [{ translateX: -100 }],
    width: 200,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
    elevation: 5,
  },
  modalTopContentRight: {
  position: 'absolute',
  top: 60, 
  right: 10, 
  width: 200,
  padding: 8,
  backgroundColor: '#fff',
  borderRadius: 4,
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
