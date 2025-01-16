import { View, Text, ImageBackground, Image } from 'react-native';
import React from 'react';

const Find = () => {
    return (
        <ImageBackground 
            source={require('./assets/Background.png')} // Path ke gambar background
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} // Pastikan background menutupi seluruh layar
        >
            <View style={{ alignItems: 'center', marginBottom: 5 }}>
                <Image 
                    style={{ height: 450, width: 450 }} 
                    source={require('./assets/Find.png')} 
                />
            </View>
            <Text style={{ marginTop: 10, fontSize: 70, color: 'white' }}>F!ND</Text>
        </ImageBackground>
    );
};

export default Find;