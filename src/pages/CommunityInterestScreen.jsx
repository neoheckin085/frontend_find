import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const CommunityInterestScreen = ({ navigation }) => {
  const interests = [
    { label: 'Gaming', icon: <Ionicons name="game-controller" size={34} color="#000" /> },
    { label: 'Friends', icon: <Ionicons name="people" size={34} color="#000" /> },
    { label: 'Study group', icon: <FontAwesome name="book" size={34} color="#000" /> },
    { label: 'Sports', icon: <Ionicons name="walk" size={34} color="#000" /> },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>Choose what community interest you want to create</Text>

      <ScrollView contentContainerStyle={styles.listContainer}>
        {interests.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.item}
            onPress={() => navigation.navigate('CreateCommunity', { interest: item.label })}
          >
            {item.icon}
            <Text style={styles.label}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default CommunityInterestScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  subtitle: {
    fontSize: 14.5,
    color: '#777',
    marginBottom: 20,
  },
  listContainer: {
    paddingVertical: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    gap: 20,
  },
  label: {
    fontSize: 18,
    color: '#000',
  },
});
