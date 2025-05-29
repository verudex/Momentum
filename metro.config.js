const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
 
const config = getDefaultConfig(__dirname)

// Add this to exclude type declaration files from routing
config.resolver.assetExts.push('d.ts');
 
module.exports = withNativeWind(config, { input: './app/globals.css' })