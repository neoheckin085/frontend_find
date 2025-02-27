import React, { useRef, useState } from 'react';
import { Image, StyleSheet, View, Text } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapView, { 
    Marker,
    PROVIDER_GOOGLE,
    Callout,
    Circle,
    Polyline,
    Polygon
} from 'react-native-maps';
import { GOOGLE_MAPS_API_KEY } from '@env'; // ✅ Ambil API Key dari .env
import 'react-native-get-random-values';

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject, zIndex: 0 },
});

export default function GoogleMapsScreen() {
  const mapRef = useRef(null);
  const [markerList, setMarkersList] = useState([
    {
      id: 1,
      latitude: -5.170977,
      longitude: 119.436224,
      title: 'Anda berada di sini',
      description: 'Ini lokasi Anda saat ini',
    },
    {
      id: 2,
      latitude: -5.139055303753419,
      longitude: 119.44981866048666,
      title: 'Tujuan Anda',
    }
  ]);

  const MyCustomMarkerView = () => (
    <Image style={{ width: 30, height: 30 }} source={require('../assets/PsmFans.png')} />
  );

  const MyCustomCalloutView = () => (
    <View style={{ width: 150 }}>
      <Text>MyCustomCalloutView</Text>
    </View>
  );

  async function moveToLocation(latitude, longitude) {
    mapRef.current.animateToRegion(
      {
        latitude,
        longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      },
      2000
    );
  }

  return (
    <View style={styles.container}>
      <View style={{ zIndex: 1, flex: 0.5 }}>
        <GooglePlacesAutocomplete
          fetchDetails={true}
          placeholder="Search"
          onPress={(data, details = null) => {
            if (details) {
              console.log(JSON.stringify(details.geometry.location));
              moveToLocation(details.geometry.location.lat, details.geometry.location.lng);
            }
          }}
          query={{
            key: GOOGLE_MAPS_API_KEY, 
            language: 'en',
          }}
          onFail={(error) => console.log(error)}
        />
      </View>

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={{
          latitude: -5.169198,
          longitude: 119.433107,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        zoomEnabled={true} // ✅ Bisa zoom dengan pinch  
        zoomControlEnabled={true} // ✅ Tampilkan tombol zoom (Android)  
        zoomTapEnabled={true} // ✅ Double-tap zoom lebih smooth  
        toolbarEnabled={true} // ✅ Toolbar Google Maps untuk kontrol tambahan  
        scrollEnabled={true} // ✅ Bisa geser dengan bebas  
        rotateEnabled={true} // ✅ Bisa memutar peta dengan dua jari  
        pitchEnabled={true} // ✅ Bisa tilt/miringkan peta untuk tampilan lebih dinamis  
        minZoomLevel={5} // ✅ Zoom out minimal  
        maxZoomLevel={20} // ✅ Zoom in maksimal  
      >
        <Marker coordinate={{ latitude: -5.156771, longitude: 119.446319 }}>
          <MyCustomMarkerView />
          <Callout style={{ width: 300, height: 100 }}>
            <MyCustomCalloutView />
          </Callout>
        </Marker>

        {markerList.map((marker) => (
          <Marker
            draggable
            key={marker.id}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            title={marker.title}
            description={marker.description}
            onDragEnd={(e) => console.log({ x: e.nativeEvent.coordinate })}
          />
        ))}

        {/* Lingkaran */}
        <Circle
          center={{ latitude: -5.156771, longitude: 119.446319 }}
          radius={200}
          strokeColor="blue"
          fillColor="#EBF5FB"
        />

        {/* Garis */}
        <Polyline
          strokeColor="red"
          strokeWidth={2}
          coordinates={[
            { latitude: -5.155345, longitude: 119.437141 },
            { latitude: -5.156771, longitude: 119.446319 },
          ]}
        />

        {/* Bentuk */}
        <Polygon
          strokeColor="red"
          fillColor="#EBF5FB"
          strokeWidth={2}
          coordinates={[
            { latitude: -5.155345, longitude: 119.437141 },
            { latitude: -5.168835124417532, longitude: 119.42946707652868 },
            { latitude: -5.169281, longitude: 119.433949 },
            { latitude: -5.155345, longitude: 119.437141 },
          ]}
        />
      </MapView>
    </View>
  );
}
