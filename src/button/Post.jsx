import React, { useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, Video, Platform } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../../context/AuthContext';

const PostScreen = () => {
  const [media, setMedia] = useState(null);
  const [caption, setCaption] = useState('');

  const pickMedia = (fromCamera = false) => {
    const options = {
      mediaType: 'mixed',
      quality: 1,
      videoQuality: 'high',
    };

    const callback = (response) => {
      if (!response.didCancel && !response.errorCode) {
        setMedia(response.assets[0]);
      }
    };

    if (fromCamera) {
      launchCamera(options, callback);
    } else {
      launchImageLibrary(options, callback);
    }
  };

  const handlePost = () => {
    if (!media) {
      alert('Pilih gambar atau video dulu');
      return;
    }
    console.log('Posting:', { caption, media });
    // Kirim ke API di sini
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Post</Text>

      <TouchableOpacity style={styles.previewBox} onPress={() => pickMedia(false)}>
        {media ? (
          media.type.startsWith('image') ? (
            <Image source={{ uri: media.uri }} style={styles.previewMedia} />
          ) : (
            <Video
              source={{ uri: media.uri }}
              style={styles.previewMedia}
              controls
              resizeMode="cover"
            />
          )
        ) : (
          <Text style={styles.placeholder}>Tap to select media</Text>
        )}
      </TouchableOpacity>

      <TextInput
        placeholder="Write a caption..."
        value={caption}
        onChangeText={setCaption}
        style={styles.caption}
        multiline
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={() => pickMedia(true)}>
          <Text style={styles.buttonText}>📷 Kamera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handlePost}>
          <Text style={styles.buttonText}>🚀  Post</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PostScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 12,
  },
  previewBox: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewMedia: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    color: '#aaa',
    fontSize: 16,
  },
  caption: {
    marginTop: 12,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    backgroundColor: '#212121',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 15,
  },
});
