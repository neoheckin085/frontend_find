import React, { useRef, useState } from 'react';
import { Image, StyleSheet, View, Text, TextInput } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

export default function GoogleMapsScreen() {
  const mapRef = useRef(null);
  const [searchText, setSearchText] = useState('');

  const [markers, setMarkers] = useState([
    {
      id: 1,
      latitude: -5.139055,
      longitude: 119.449818,
      title: 'Ikasi Kota Makassar',
      image: require('../assets/IkasiMakassar.png'),
    },
    {
      id: 2,
      latitude: -5.156771,
      longitude: 119.446319,
      title: 'TLCavalryID',
      image: require('../assets/TlCavalary.png'),
    },
    {
      id: 3,
      latitude: -5.170977,
      longitude: 119.436224,
      title: 'PSM Fans',
      image: require('../assets/PsmFans.png'),
    },
  ]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={{
          latitude: -5.150000,
          longitude: 119.440000,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {markers.map((marker) => (
          <Marker key={marker.id} coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}>
            <View style={styles.markerContainer}>
              <Text style={styles.markerText}>{marker.title}</Text>
              <Image source={marker.image} style={styles.markerImage} />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Cari lokasi..."
        placeholderTextColor="#888"
        value={searchText}
        onChangeText={setSearchText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject, zIndex: 0 },

  markerContainer: {
    alignItems: 'center',
  },

  markerText: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 2,
    paddingHorizontal: -16,
    borderRadius: 5,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },

  markerImage: {
    width: 50,
    height: 50,
    borderRadius: 50,
    borderWidth: -1,
    borderColor: 'white',
  },

  searchBar: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 40,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    fontSize: 16,
  },
});
