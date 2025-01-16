import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import Gambar from '../assets/IkasiMakassar.png';
import Gambar2 from '../assets/TlCavalary.png';
import Gambar3 from '../assets/PsmFans.png';
import Logo2 from '../assets/logoliquid.jpg'

const Home = () => {
  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={styles.judulContainer}>
        <Image style={styles.logo} source={Gambar} />
        <Text style={styles.judul}>IkasiMakassar</Text>
      </View>
      <View style={styles.card}>
        <Image style={styles.gambar} source={Gambar} />
        <View style={styles.cardBody}>
          <Text style={styles.cardTittle}>IkasiMakassar</Text>
          <Text style={styles.cardDescription}>
            Sebagai salah satu dari Sebelas Fatui Harbinger , Arlecchino sangat
            menghormati Tsaritsa , meskipun dia menyatakan bahwa dia bersedia
            mengkhianati Tsaritsa jika kepentingan mereka berbeda. Arlecchino
            bekerja untuk mencapai tujuannya dengan memperoleh Gnose atas
            namanya. Dia menangani masalah Fatui dengan sangat penting dan
            tampil anggun dan ramah.
          </Text>
        </View>
      </View>
      <View style={styles.judulContainer}>
        <Image style={styles.logo} source={Logo2} />
        <Text style={styles.judul}>TlCavalary</Text>
      </View>
      <View style={styles.card}>
        <Image style={styles.gambar} source={Gambar2} />
        <View style={styles.cardBody}>
          <Text style={styles.cardTittle}>Arlechino</Text>
          <Text style={styles.cardDescription}>
            Sebagai salah satu dari Sebelas Fatui Harbinger , Arlecchino sangat
            menghormati Tsaritsa , meskipun dia menyatakan bahwa dia bersedia
            mengkhianati Tsaritsa jika kepentingan mereka berbeda. Arlecchino
            bekerja untuk mencapai tujuannya dengan memperoleh Gnose atas
            namanya. Dia menangani masalah Fatui dengan sangat penting dan
            tampil anggun dan ramah.
          </Text>
        </View>
      </View>
      <View style={styles.judulContainer}>
        <Image style={styles.logo} source={Gambar3} />
        <Text style={styles.judul}>PsmFans</Text>
      </View>
      <View style={styles.card}>
        <Image style={styles.gambar} source={Gambar3} />
        <View style={styles.cardBody}>
          <Text style={styles.cardTittle}>Psm Fans</Text>
          <Text style={styles.cardDescription}>
            Sebagai salah satu dari Sebelas Fatui Harbinger , Arlecchino sangat
            menghormati Tsaritsa , meskipun dia menyatakan bahwa dia bersedia
            mengkhianati Tsaritsa jika kepentingan mereka berbeda. Arlecchino
            bekerja untuk mencapai tujuannya dengan memperoleh Gnose atas
            namanya. Dia menangani masalah Fatui dengan sangat penting dan
            tampil anggun dan ramah.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  judulContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 18,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 50,
    marginRight: 15
  },
  judul: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
    marginTop: 1,
  },
  card: {
    margin: 3,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gambar: {
    width: '100%',
    height: 400,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  cardBody: {
    padding: 10,
  },
  cardTittle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default Home;