import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, TextInput, Button, KeyboardAvoidingView, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const messages = [
  { id: '1', name: 'psmfans1915', sender: 'Eqi', message: 'adakah nobar', avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRSXBzOgUojdYeF3P-fP4TLuUNPSSbLsJk_Q&s', isUnread: true, allMessages: ['Eqi: Halo', 'Eqi: Apa kabar?'] },
  { id: '2', name: 'ikasikotamakassar', sender: 'La Besse', message: 'Bagaimanaji pertandingannu?', avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJJHyC-tE-Z5VyPjHNDoFrrgyebKVyhpLC3w&s', isUnread: false, allMessages: ['La Besse: Selamat pagi', 'La Besse: Ada kabar apa?'] },
  { id: '3', name: 'makassar.pubg', sender: 'Jeki', message: 'infokan permabaran', avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXy4SLmx0FwY_wnUTrTpLzuebOTroiHJ0bpw&s', isUnread: true, allMessages: ['Jeki: Main bareng yuk', 'Jeki: Jam berapa?'] },
  { id: '4', name: 'christyzer.ofc', sender: 'Rifat', message: 'adakah event', avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIrTUnK8DR0Rn8kBNoPcaSgAwM1UzzHGQpaw&s', isUnread: false, allMessages: ['Rifat: Lagi sibuk apa?', 'Rifat: Nanti ngobrol yuk!'] },
];

const ChatList = ({ navigation }) => {
  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('Messages', item)}>
      <View style={styles.chatItem}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.chatInfo}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.message} numberOfLines={1}>{item.sender}: {item.message}</Text>
        </View>
        {item.isUnread && <View style={styles.unreadIndicator} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList data={messages} keyExtractor={(item) => item.id} renderItem={renderItem} />
  );
};

const Messages = ({ route, navigation }) => {
  const { name, sender, message, allMessages } = route.params || {};
  const [inputMessage, setInputMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([...allMessages || [], `${sender}: ${message}`]);

  React.useLayoutEffect(() => {
    if (name) {
      navigation.setOptions({ title: name });
    }
  }, [navigation, name]);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      setChatMessages([...chatMessages, `Anda: ${inputMessage}`]);
      setInputMessage('');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <FlatList
        data={chatMessages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => {
          const [msgSender, ...textParts] = item.split(":");
          const text = textParts.join(":").trim();
          const isUser = msgSender.trim() === "Anda";
          return (
            <View style={[styles.chatBubble, isUser ? styles.chatBubbleUser : styles.chatBubbleOther]}>
              <Text style={[styles.senderName, isUser ? styles.senderUser : styles.senderOther]}>{msgSender.trim()}</Text>
              <Text style={[styles.chatText, { color: '#000' }]}>{text}</Text>
            </View>
          );
        }}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputMessage}
          onChangeText={setInputMessage}
          placeholder="Ketik pesan..."
        />
        <Button title="Kirim" onPress={handleSendMessage} />
      </View>
    </KeyboardAvoidingView>
  );
};

const Stack = createStackNavigator();

const App = () => {
  return (
      <Stack.Navigator>
        <Stack.Screen name="ChatList" component={ChatList} options={{ title: "Daftar Grup" }} />
        <Stack.Screen name="Messages" component={Messages} />
      </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    borderRadius: 10,
    maxWidth: '80%',
  },
  chatBubbleUser: {
    backgroundColor: '#dcf8c6',
    alignSelf: 'flex-end',
  },
  chatBubbleOther: {
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start',
  },
  senderName: {
    fontWeight: 'bold',
  },
  senderUser: {
    color: '#007bff',
  },
  senderOther: {
    color: '#000',
  },
  chatText: {
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 10,
    marginRight: 10,
  },
});

export default App;
