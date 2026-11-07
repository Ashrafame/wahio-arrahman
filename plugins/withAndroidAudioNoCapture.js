// Prevents Android's Live Caption (and any other system audio capture service)
// from transcribing audio played by this app. Without this flag, Android 10+
// devices show AI-generated captions of Arabic Quran recitation in English,
// which is both inaccurate and disruptive.
//
// Android API: android:allowAudioPlaybackCapture (added in API 29 / Android 10)
// Values: "false" = no system service may capture audio output from this app.
const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withAndroidAudioNoCapture(config) {
  return withAndroidManifest(config, (config) => {
    const app = config.modResults.manifest.application?.[0];
    if (app) {
      app.$['android:allowAudioPlaybackCapture'] = 'false';
    }
    return config;
  });
};
