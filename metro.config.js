const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const { wrapWithReanimatedMetroConfig } = require("react-native-reanimated/metro-config");

let config = getDefaultConfig(__dirname);

// // Exclude `.d.ts` files
// config.resolver.assetExts.push('d.ts');

// Apply NativeWind config
config = withNativeWind(config, {
  input: './app/globals.css',
});

config.resolver.sourceExts.push('cjs');
config.resolver.unstable_enablePackageExports = false;

// Wrap with Reanimated config
module.exports = wrapWithReanimatedMetroConfig(config);