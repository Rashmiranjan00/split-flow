const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure packages with "react-native" export condition (like zustand)
// resolve to their CJS entry on web, avoiding import.meta usage that
// breaks in non-module script contexts.
config.resolver.unstable_conditionsByPlatform.web = [
  'react-native',
  'browser',
];

module.exports = config;
