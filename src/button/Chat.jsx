import React from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const messages = [
  { id: '1', name: 'psmfans1915', message: 'Eqi: adakah nobar', avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRSXBzOgUojdYeF3P-fP4TLuUNPSSbLsJk_Q&s', isUnread: true, allMessages: ['Halo', 'Apa kabar?'] },
  { id: '2', name: 'ikasikotamakassar', message: 'La besse: Bagaimanaji pertan...', avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJJHyC-tE-Z5VyPjHNDoFrrgyebKVyhpLC3w&s', isUnread: false, allMessages: ['Selamat pagi', 'Ada kabar apa?'] },
  { id: '3', name: 'makassar.pubg', message: 'Jeki: infokan permabaran', avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXy4SLmx0FwY_wnUTrTpLzuebOTroiHJ0bpw&s', isUnread: true, allMessages: ['Main bareng yuk', 'Jam berapa?'] },
  { id: '4', name: 'christyzer.ofc', message: 'Rifat: adakah event JKT48', avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIrTUnK8DR0Rn8kBNoPcaSgAwM1UzzHGQpaw&s', isUnread: false, allMessages: ['Lagi sibuk apa?', 'Nanti ngobrol yuk!'] },
];

const ChatList = ({ navigation }) => {
  const renderItem = ({ item }) => (
    <TouchableOpacity
  onPress={() =>
    navigation.navigate('Messages', {
      name: item.name,
      message: item.message, // Pesan terakhir yang terlihat di luar
      allMessages: item.allMessages,
    })
  }
>
      <View style={styles.chatItem}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.chatInfo}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.message} numberOfLines={1}>
            {item.message}
          </Text>
        </View>
        {item.isUnread && <View style={styles.unreadIndicator} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Chat List */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const Messages = ({ route }) => {
  const { name, message, allMessages } = route.params;

  // Gabungkan pesan terakhir (dari luar) ke bagian bawah daftar pesan
  const updatedMessages = [...allMessages, message];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{name}</Text>
      </View>
      <FlatList
        data={updatedMessages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.chatBubble}>
            <Text style={styles.chatText}>{item}</Text>
          </View>
        )}
      />
    </View>
  );
};

const Stack = createStackNavigator();

const Chat = () => {
  return (
      <Stack.Navigator initialRouteName="ChatList">
        <Stack.Screen name="ChatList" component={ChatList} options={{ headerShown: false }} />
        <Stack.Screen name="Messages" component={Messages} />
      </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 60,
    justifyContent: 'center',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  chatInfo: {
    flex: 1,
    marginLeft: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  message: {
    fontSize: 14,
    color: '#666',
  },
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007bff',
  },
  chatBubble: {
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  chatText: {
    fontSize: 14,
    color: '#000',
  },
});

export default Chat;
