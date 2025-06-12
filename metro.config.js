const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  crypto: require.resolve('expo-crypto'),
};

config.resolver.unstable_enablePackageExports = false;

config.resetCache = true;

module.exports = config;