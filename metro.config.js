const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Configure Metro to handle .txt files as text assets
config.resolver.sourceExts = [...(config.resolver.sourceExts || []), 'txt'];

module.exports = withNativeWind(config, { input: './global.css', inlineRem: 16 });
