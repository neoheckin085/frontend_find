import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const premiumPackages = [
  { id: '1', title: '+ 1 Moon', price: 'Rp 7.000' },
  { id: '2', title: '+ 1 Moon', price: 'Rp 7.000' },
  { id: '3', title: '+ 1 Moon', price: 'Rp 7.000' },
  { id: '4', title: '+ 1 Moon', price: 'Rp 7.000' },
];

const PremiumScreen = () => {
  const navigation = useNavigation();

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardPrice}>{item.price}</Text>
      <TouchableOpacity style={styles.buyButton}>
        <Text style={styles.buyText}>Buy</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Get Premium</Text>
      </View>
       
      {/* Paket Premium */}
      <FlatList
        data={premiumPackages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContainer}
      />

      {/* Fitur Premium */}
      <View style={styles.featureContainer}>
        <View style={styles.featureHeader}>
          <Text style={styles.featureTitle}>Fitur Premium</Text>
        </View>
        <View style={styles.featureContent}>
          <Text style={styles.featureText}>✔ Bebas Iklan</Text>
          <Text style={styles.featureText}>✔ Akses Eksklusif</Text>
          <Text style={styles.featureText}>✔ Prioritas Support</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 2,
    marginBottom: 30,
    backgroundColor: '#fff',
  },
  listContainer: {
    padding: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#d1cdcd',
    width: '47%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'green',
  },
  cardPrice: {
    fontSize: 16,
    marginVertical: 5,
  },
  buyButton: {
    backgroundColor: '#000',
    paddingVertical: 8,
    paddingHorizontal: 30,
    borderRadius: 5,
    marginTop: 5,
  },
  buyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
  backgroundColor: 'black',
  paddingVertical: 20,
  paddingHorizontal: 20,
  borderBottomLeftRadius: 30, 
  borderBottomRightRadius: 30,
  alignItems: 'center',
  position: 'relative',
},
headerTitle: {
  fontSize: 22,
  fontWeight: 'bold',
  color: '#fff',
},
backButton: {
  position: 'absolute',
  left: 10,
  top: '50%',
  transform: [{ translateY: -15 }],
  padding: 10, 
  borderRadius: 50,
},
backText: {
  fontSize: 28, 
  color: '#fff',
  fontWeight: 'bold',
},


  featureContainer: {
    backgroundColor: '#c3bebe',
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 30,
    paddingBottom: 20,
    alignItems: 'center',
  },
  featureHeader: {
    backgroundColor: '#2A2A2A',
    paddingVertical: 12,
    paddingHorizontal: 120,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    position: 'absolute',
    top: -20,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  featureContent: {
    marginTop: 30, 
    padding: 20,
    alignItems: 'center',
  },
  featureText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 5,
    color: '#333',
  },
});

export default PremiumScreen;
