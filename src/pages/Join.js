import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';

const Join = () => {
  const route = useRoute();
  const { community } = route.params;
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={community.mapImage} style={styles.mapImage} />
        <Image source={community.logo} style={styles.communityLogo} />
      </View>

      {/* Info Komunitas */}
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{community.name}</Text>
        <Text style={styles.subtitle}>Oleh: {community.owner}</Text>
        <Text style={styles.memberCount}>{community.members} Anggota</Text>
        
        <Text style={styles.sectionTitle}>Deskripsi Komunitas:</Text>
        <Text style={styles.description}>{community.description}</Text>

        <Text style={styles.sectionTitle}>Gambar Komunitas:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {community.images?.map((img, index) => (
            <Image key={index} source={img} style={styles.communityImage} />
          ))}
        </ScrollView>

        <TouchableOpacity 
          style={[
            styles.followButton, 
            { 
              borderColor: isFollowing ? '#000' : '#fff',
              backgroundColor: isFollowing ? '#fff'  :'#000', }
          ]}
          onPress={handleFollow}
        >
          <Text style={[styles.followText, { color: isFollowing ? '#000' : '#fff'  }]}>
            {isFollowing ? 'Mengikuti' : 'Ikuti'}
          </Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
   flex: 1,
    backgroundColor: '#fff' 
},
  header: {
    alignItems: 'center', 
    marginBottom: 20 
},
  mapImage: { 
    width: '100%', 
   height: 150 
},
  communityLogo: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    marginTop: -40 
},
  infoContainer: { 
    padding: 20 
},
  title: { 
    fontSize: 32,
    marginBottom: 10, 
    fontWeight: 'bold', 
    textAlign: 'center' 
},
  subtitle: { 
    textAlign: 'center', 
    marginBottom: 8, 
    fontSize: 14 ,
    color: 'gray'
},
  memberCount: { 
    textAlign: 'center', 
    fontWeight: 'bold', 
    marginVertical: 5,
    fontSize: 19,
},
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginTop: 15 
},
  description: { 
    fontSize: 16, 
    marginTop: 5 
},
  communityImage: { 
    width: 200, 
    height: 200, 
    borderRadius: 10, 
    margin: 5 
},
  followButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderRadius: 5,
    alignItems: 'center',
  },
  followText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Join;
