# Offline hymn audio

## Download from GitHub (one-time, needs internet)

The app used to stream from [nati-badi/muzmur-assets](https://github.com/nati-badi/muzmur-assets). To copy whatever is published there into this folder:

```bash
npm run fetch:audio
```

Use `npm run fetch:audio:scan` to probe every hymn id in `mezmurs.json` (slower; most ids are not uploaded yet).

Then bundle into the APK: `npm run bundle:audio` before `npm run build:apk`.

---

Place one file per hymn **using the hymn `id` as the filename**:

- Amharic hymns: `1.m4a`, `2.mp3`, … (same ids as in `src/data/mezmurs.json`)
- Oromo hymns: `oro_1.m4a` **or** `1.m4a` if you use the numeric part only

Supported formats: `.m4a`, `.mp3`, `.aac`, `.wav`

## Ship audio inside the APK (no internet)

1. Copy your audio files into this folder (`assets/audio/`).
2. Run `npm run bundle:audio` (copies into the Android asset bundle).
3. Rebuild the app (`npm run prebuild:android` then `npm run build:apk`).

## Install on a phone without rebuilding

In the app: **Settings → Offline audio → Import audio files**  
Pick files named like `42.m4a`; they are stored on the device for playback.