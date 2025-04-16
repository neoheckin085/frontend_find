import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const notifications = [
  {
    id: '1',
    title: 'Permintaan anda ditolak.',
    description: 'Yah... permintaan anda untuk mengikuti Ikasi Kota Makassar ditolak.',
    image: require('../assets/IkasiMakassar.png'), 
  },
  {
    id: '1',
    title: 'Seseorang menyukai post anda.',
    description: '@Faviann menyukai post anda.',
    image: require('../assets/Favian.png'),
  },
  {
    id: '3',
    title: 'Permintaan bergabung ke grup',
    description: '@Faviann ingin bergabung ke Komunitas anda. Tekan disini untuk meninjau',
    image: require('../assets/Favian.png'),
  },
];

const NotificationScreen = () => {
  const navigation = useNavigation();

  const renderItem = ({ item }) => (
    <View style={styles.notificationContainer}>
      <Image source={item.image} style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>

      {/* List Notifikasi */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  notificationContainer: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  textContainer: {
    marginLeft: 10,
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
});

export default NotificationScreen;
