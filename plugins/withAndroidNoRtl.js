// The app renders right-to-left manually on every screen (via the `isRTL`
// setting: explicit `flexDirection: 'row-reverse'` and `textAlign`). On an
// Arabic-locale Android device, the OS ALSO turns on native RTL mirroring, so
// our manual direction gets flipped a second time — mirroring icons and pushing
// Arabic text to the left. Declaring the app as not RTL-aware disables the
// native mirroring on Android, leaving our manual direction as the single
// source of truth (matching iOS, where native RTL is off by default here).
const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withAndroidNoRtl(config) {
  return withAndroidManifest(config, (config) => {
    const app = config.modResults.manifest.application?.[0];
    if (app) {
      app.$['android:supportsRtl'] = 'false';
    }
    return config;
  });
};
