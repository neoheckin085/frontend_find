const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    // Add resolution for packages that might have issues
    extraNodeModules: {
      '@react-native-community/netinfo': require.resolve('@react-native-community/netinfo'),
      'pusher-js': require.resolve('pusher-js/react-native'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
