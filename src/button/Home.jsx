import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Gambar from '../assets/IkasiMakassar.png';
import Gambar2 from '../assets/TlCavalary.png';
import Gambar3 from '../assets/PsmFans.png';
import Logo2 from '../assets/logoliquid.jpg';

const Home = () => {
  const [liked, setLiked] = useState([false, false, false]);
  const [showLikeIcon, setShowLikeIcon] = useState([false, false, false]);
  const navigation = useNavigation();

  const toggleLike = (index) => {
    const updatedLiked = [...liked];
    updatedLiked[index] = !updatedLiked[index];
    setLiked(updatedLiked);
  };

  const handleDoubleTap = (index) => {
    if (!liked[index]) {
      toggleLike(index);
    }
    const updatedShowLikeIcon = [...showLikeIcon];
    updatedShowLikeIcon[index] = true;
    setShowLikeIcon(updatedShowLikeIcon);
    setTimeout(() => {
      updatedShowLikeIcon[index] = false;
      setShowLikeIcon([...updatedShowLikeIcon]);
    }, 1000);
  };

  const Card = ({ image, logo, title, description, index, community }) => (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => navigation.navigate('Join', { community })}>
        <View style={styles.cardHeader}>
          <Image style={styles.logo} source={logo} />
          <Text style={styles.judul}>{title}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity activeOpacity={0.7} onPress={() => handleDoubleTap(index)}>
        <Image style={styles.gambar} source={image} />
        {showLikeIcon[index] && (
          <View style={styles.likeIconContainer}>
            <Icon name="heart" size={60} color="#e74c3c" />
          </View>
        )}
      </TouchableOpacity>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => toggleLike(index)}>
          <Icon name="heart" size={30} color={liked[index] ? '#e74c3c' : '#bdc3c7'} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => navigation.navigate('Comment')}
        >
          <Icon name="comment-o" size={30} color="#bdc3c7" />  
        </TouchableOpacity>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardDescription}>
          <Text style={styles.cardTittle}>{title}</Text> - {description}
        </Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={{ flex: 1 }}>
      <Card image={Gambar} 
        logo={Gambar} title="IkasiMakassar" 
        description="Komunitas pecinta olahraga di Makassar" 
        index={0}
        community={{
          name: "IkasiMakassar",
          owner: "Admin Ikasi",
          members: 500,
          description: "Komunitas pecinta olahraga di Makassar",
         mapImage: require('../assets/IkasiMakassar.png'),
          logo: require('../assets/IkasiMakassar.png'),
          images: [
      require('../assets/IkasiMakassar.png'),
      require('../assets/IkasiMakassar.png'),
      require('../assets/IkasiMakassar.png'),
      require('../assets/IkasiMakassar.png'),
      require('../assets/IkasiMakassar.png'),
    ]}}
      />
      <Card 
        image={Gambar2} 
        logo={Logo2} title="TlCavalary" 
        description="Komunitas penggemar Team Liquid" 
        index={1} 
        community={{
          name: "TlCavalary",
          owner: "Admin Cavalary",
          members: 300,
          description: "Komunitas penggemar Team Liquid",
          mapImage: require('../assets/Maps.png'),
          logo: require('../assets/logoliquid.jpg'),
          images: [
      require('../assets/logoliquid.jpg'),
      require('../assets/logoliquid.jpg'),
      require('../assets/logoliquid.jpg'),
      require('../assets/logoliquid.jpg'),
      require('../assets/logoliquid.jpg'),
    ]
        }}
      />
      <Card 
        image={Gambar3} 
        logo={Gambar3} 
        title="Psm Fans" 
        description="Komunitas supporter PSM Makassar" 
        index={2} 
        community={{
          name: "Psm Fans",
          owner: "Admin PSM",
          members: 1000,
          description: "Komunitas supporter PSM Makassar",
          mapImage: require('../assets/Maps.png'),
          logo: require('../assets/PsmFans.png'),
          images: [
      require('../assets/PsmFans.png'),
      require('../assets/PsmFans.png'),
      require('../assets/PsmFans.png'),
      require('../assets/PsmFans.png'),
      require('../assets/PsmFans.png'),
    ]
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  cardTittle: {
     fontWeight: 'bold' 
    },
  cardHeader: {
     flexDirection: 'row',
      alignItems: 'center',
       justifyContent: 'flex-start',
        padding: 10 
      },
  logo: {
      width: 40,
      height: 40,
      borderRadius: 50,
      marginRight: 10
       },
  judul: { fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'center',
      marginTop: 2,
       },
  card: { margin: 3,
     borderRadius: 8,
      backgroundColor: '#fff',
       shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
         shadowOpacity: 0.1, shadowRadius: 4, elevation: 3
         },
  gambar: {
     width: '100%',
      height: 450,
       borderTopLeftRadius: 8,
        borderTopRightRadius: 8
       },
  likeIconContainer: {
     position: 'absolute',
      top: '40%',
       left: '45%',
        justifyContent: 'center',
         alignItems: 'center'
         },
  cardBody: {
     padding: 15
     },
  cardDescription: {
     fontSize: 16,
      lineHeight: 22 
    },
  cardActions: {
     flexDirection: 'row',
      alignItems: 'center',
       padding: 10
       },
  actionButton: {
     marginRight: 20
     },
});

export default Home;
