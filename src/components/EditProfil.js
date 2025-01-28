import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Button, Alert, ImageBackground, ScrollView } from 'react-native';
import Logokecil from '../assets/Favian.png';
import Logobesar from '../assets/makassar.jpg';
import { launchImageLibrary } from 'react-native-image-picker'; // Import untuk membuka galeri

const EditProfil = ({ navigation }) => {
  const [name, setName] = useState('');
  const [tentang, setTentang] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [email, setEmail] = useState('');
  const [instagram, setInstagram] = useState('');
  const [selectedImage, setSelectedImage] = useState(Logokecil); // Default ke Logokecil
  const [selectedLargeImage, setSelectedLargeImage] = useState(Logobesar); // Default ke Logobesar

  const handleImageChange = () => {
    // Menampilkan pilihan untuk memilih foto
    Alert.alert(
      'Pilih Foto Profil',
      'Pilih gambar profil yang ingin digunakan',
      [
        {
          text: 'Edit Profil Kecil',
          onPress: () => setSelectedImage(Logokecil), // Set ke Logokecil
        },
        {
          text: 'Edit Profil Besar',
          onPress: () => openGalleryForLargeImage(), // Membuka galeri untuk memilih gambar besar
        },
        { text: 'Batal', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const openGalleryForLargeImage = () => {
    // Membuka galeri gambar untuk memilih gambar besar
    launchImageLibrary({ mediaType: 'photo', quality: 1 }, (response) => {
      if (response.didCancel) {
        console.log('User canceled image picker');
      } else if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        const source = { uri: response.assets[0].uri }; // Mendapatkan uri gambar yang dipilih
        setSelectedLargeImage(source); // Mengatur gambar besar yang baru
      }
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Logo besar tetap di background */}
      <ImageBackground
        source={selectedLargeImage} // Gambar besar yang dipilih
        style={styles.backgroundImage}
        resizeMode='cover'
      >
      </ImageBackground>

      {/* Gambar profil kecil yang bisa diganti */}
      <TouchableOpacity style={styles.kecil} onPress={handleImageChange}>
        <Image
          source={selectedImage} // Gambar kecil yang dipilih
          style={styles.image}
        />
      </TouchableOpacity>

      {/* Teks untuk mengganti foto sebagai tombol */}
      <TouchableOpacity onPress={handleImageChange}>
        <Text style={styles.imageText}>Ganti Foto</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Nama"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Tentang"
        value={tentang}
        onChangeText={setTentang}
      />
      <TextInput
        style={styles.input}
        placeholder="Whatsapp"
        value={whatsapp}
        onChangeText={setWhatsapp}
      />
      <TextInput
        style={styles.input}
        placeholder="Lokasi"
        value={lokasi}
        onChangeText={setLokasi}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Instagram"
        value={instagram}
        onChangeText={setInstagram}
      />

      <Button
        title="Simpan"
        onPress={() => {
          console.log(`Nama: ${name}, Whatsapp: ${whatsapp}, Lokasi: ${lokasi}, Email: ${email}, Instagram: ${instagram}`);
          
          // Mengirim data ke halaman Profil
          navigation.navigate('Profil', {
            name,
            whatsapp,
            lokasi,
            email,
            instagram,
            selectedImage,   // Gambar kecil yang dipilih
            selectedLargeImage, // Gambar besar yang dipilih
          });
        }}
      />
    </ScrollView>
  );
};

const styles = {
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
    paddingBottom: 30,
  },

  backgroundImage: {
    flex: 1,
    opacity: 0.9,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: 200,
    marginBottom: 20,
    marginTop: 10,
  },
  imageText: {
    fontSize: 14,
    color: '#007BFF',
    alignItems: 'center',
    marginTop: 10,
    textAlign: 'center',
  },
  kecil: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
  },
};

export default EditProfil;
