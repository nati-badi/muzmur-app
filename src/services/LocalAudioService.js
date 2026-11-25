const FileSystem = require('expo-file-system/legacy');
const { Platform } = require('react-native');
const mezmursData = require('../data/mezmurs.json');
const oroMezmursData = require('../data/OroMuzmurs.json');

const AUDIO_EXTENSIONS = ['m4a', 'mp3', 'aac', 'wav'];

let bundledManifest = null;
try {
  bundledManifest = require('../../assets/audio/manifest.json');
} catch {
  bundledManifest = { downloaded: [] };
}

/** @type {Set<string> | null} */
let audioAvailabilitySet = null;

class LocalAudioService {
  static get mezmursDir() {
    return `${FileSystem.documentDirectory}mezmurs/`;
  }

  static async ensureMezmursDir() {
    const info = await FileSystem.getInfoAsync(this.mezmursDir);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(this.mezmursDir, { intermediates: true });
    }
  }

  static hymnIdCandidates(hymnId) {
    const id = String(hymnId);
    const candidates = [id];
    if (id.startsWith('oro_')) {
      candidates.push(id.slice(4));
    }
    return [...new Set(candidates)];
  }

  static parseIdFromFilename(filename) {
    const base = filename.replace(/\.[^.]+$/, '');
    return base.trim();
  }

  static async fileExists(uri) {
    try {
      const info = await FileSystem.getInfoAsync(uri);
      return info.exists;
    } catch {
      return false;
    }
  }

  static async resolvePlaybackUris(mezmur) {
    const uris = [];
    const seen = new Set();
    const add = async (uri) => {
      if (!uri || seen.has(uri)) return;
      if (await this.fileExists(uri)) {
        seen.add(uri);
        uris.push(uri);
      }
    };

    const audioUrl = mezmur?.audioUrl;
    if (audioUrl && audioUrl !== '#' && !/^https?:\/\//i.test(audioUrl)) {
      await add(audioUrl);
    }

    const bases = this.hymnIdCandidates(mezmur.id);
    for (const base of bases) {
      for (const ext of AUDIO_EXTENSIONS) {
        await add(`${this.mezmursDir}${base}.${ext}`);
        if (Platform.OS === 'android') {
          await add(`file:///android_asset/audio/${base}.${ext}`);
        }
        if (FileSystem.bundleDirectory) {
          await add(`${FileSystem.bundleDirectory}audio/${base}.${ext}`);
        }
      }
    }

    return uris;
  }

  static async hasLocalAudio(mezmur) {
    const uris = await this.resolvePlaybackUris(mezmur);
    return uris.length > 0;
  }

  static async countStoredFiles() {
    try {
      await this.ensureMezmursDir();
      const names = await FileSystem.readDirectoryAsync(this.mezmursDir);
      return names.filter((n) => AUDIO_EXTENSIONS.some((ext) => n.toLowerCase().endsWith(`.${ext}`))).length;
    } catch {
      return 0;
    }
  }

  static async importAudioFile(sourceUri, filename) {
    await this.ensureMezmursDir();
    const id = this.parseIdFromFilename(filename);
    if (!id) {
      return { success: false, error: 'Invalid filename' };
    }
    const ext = filename.split('.').pop().toLowerCase();
    if (!AUDIO_EXTENSIONS.includes(ext)) {
      return { success: false, error: 'Unsupported format' };
    }
    const dest = `${this.mezmursDir}${id}.${ext}`;
    await FileSystem.copyAsync({ from: sourceUri, to: dest });
    this.invalidateAudioAvailability();
    return { success: true, id, dest };
  }

  static getTotalHymnCount() {
    return mezmursData.length + oroMezmursData.length;
  }

  static getBundledAudioIds() {
    const ids = new Set();
    (bundledManifest?.downloaded || []).forEach((name) => {
      const id = this.parseIdFromFilename(name);
      if (id) ids.add(id);
    });
    return ids;
  }

  static getCoverageSummary() {
    const bundled = this.getBundledAudioIds();
    const total = this.getTotalHymnCount();
    return {
      totalHymns: total,
      bundledCount: bundled.size,
      bundledIds: bundled,
    };
  }

  static isBundledHymnId(hymnId) {
    const id = String(hymnId);
    const bundled = this.getBundledAudioIds();
    if (bundled.has(id)) return true;
    if (id.startsWith('oro_')) return bundled.has(id.slice(4));
    return false;
  }

  static idInAvailabilitySet(hymnId, set) {
    const id = String(hymnId);
    if (set.has(id)) return true;
    if (id.startsWith('oro_')) return set.has(id.slice(4));
    return false;
  }

  static isAudioAvailable(hymnId) {
    if (audioAvailabilitySet) {
      return this.idInAvailabilitySet(hymnId, audioAvailabilitySet);
    }
    return this.isBundledHymnId(hymnId);
  }

  static async refreshAudioAvailability() {
    const ids = new Set(this.getBundledAudioIds());
    try {
      await this.ensureMezmursDir();
      const names = await FileSystem.readDirectoryAsync(this.mezmursDir);
      names.forEach((name) => {
        if (!AUDIO_EXTENSIONS.some((ext) => name.toLowerCase().endsWith(`.${ext}`))) return;
        const id = this.parseIdFromFilename(name);
        if (id) ids.add(id);
      });
    } catch {
      // ignore scan errors; bundled ids still apply
    }
    audioAvailabilitySet = ids;
    return ids;
  }

  static invalidateAudioAvailability() {
    audioAvailabilitySet = null;
  }

  static async importPickerAssets(assets) {
    const results = [];
    for (const asset of assets) {
      const name = asset.name || `audio.${asset.mimeType?.includes('mpeg') ? 'mp3' : 'm4a'}`;
      const copied = await this.importAudioFile(asset.uri, name);
      results.push({ name, ...copied });
    }
    const ok = results.filter((r) => r.success).length;
    return { success: ok > 0, imported: ok, total: results.length, results };
  }
}

module.exports = LocalAudioService;