import { open } from '@tauri-apps/plugin-dialog';
import { BaseDirectory, copyFile, readFile, readTextFile, writeTextFile, exists, stat, mkdir, writeFile, readDir } from '@tauri-apps/plugin-fs';
import { appLocalDataDir, join, basename } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/core';

// Ensure the application's local data directory exists
const ensureDataDir = async () => {
  try {
    const dataDirExists = await exists('', { baseDir: BaseDirectory.AppLocalData });
    if (!dataDirExists) {
      await mkdir('', { baseDir: BaseDirectory.AppLocalData, recursive: true });
    }
  } catch (e) {
    console.error("Failed to ensure data dir", e);
  }
};

export const api = {
  loadLibrary: async () => {
    try {
      await ensureDataDir();
      const hasLib = await exists('library.json', { baseDir: BaseDirectory.AppLocalData });
      if (hasLib) {
        const content = await readTextFile('library.json', { baseDir: BaseDirectory.AppLocalData });
        return JSON.parse(content);
      }
    } catch (e) {
      console.error("Error loading library", e);
    }
    return [];
  },

  saveLibrary: async (data) => {
    try {
      await ensureDataDir();
      await writeTextFile('library.json', JSON.stringify(data), { baseDir: BaseDirectory.AppLocalData });
    } catch (e) {
      console.error("Error saving library", e);
    }
  },

  checkExists: async (fileId) => {
    try {
      return await exists(fileId, { baseDir: BaseDirectory.AppLocalData });
    } catch (e) {
      return false;
    }
  },

  getFileSize: async (fileId) => {
    try {
      const s = await stat(fileId, { baseDir: BaseDirectory.AppLocalData });
      return s ? s.size : 0;
    } catch (e) {
      return 0;
    }
  },

  getFile: async (fileId) => {
    try {
      const contents = await readFile(fileId, { baseDir: BaseDirectory.AppLocalData });
      const name = fileId.split('_').slice(3).join('_'); // Extract original name from fileId
      return new File([contents], name);
    } catch (e) {
      console.error("Failed to get file", e);
      return null;
    }
  },

  saveFile: async (fileId, file) => {
    try {
      await ensureDataDir();
      if (file.isTauriPath) {
        await copyFile(file.tauriPath, fileId, { toPathBaseDir: BaseDirectory.AppLocalData });
      } else {
        const buffer = await file.arrayBuffer();
        await writeFile(fileId, new Uint8Array(buffer), { baseDir: BaseDirectory.AppLocalData });
      }
    } catch (e) {
      console.error("Failed to save file", e);
    }
  },

  openFiles: async () => {
    try {
      const selected = await open({
        multiple: true,
        directory: false,
      });
      if (!selected) return [];
      
      const paths = Array.isArray(selected) ? selected : [selected];
      const results = [];
      
      for (const filePath of paths) {
        const name = await basename(filePath);
        const s = await stat(filePath);
        results.push({ name, size: s.size, isTauriPath: true, tauriPath: filePath });
      }
      return results;
    } catch (e) {
      console.error("Failed to open files via dialog", e);
      return [];
    }
  },

  listMusic: async () => {
    try {
      await ensureDataDir();
      const entries = await readDir('', { baseDir: BaseDirectory.AppLocalData });
      const results = [];
      for (const entry of entries) {
        if (entry.name && entry.name.startsWith('music_')) {
          results.push({ 
            name: entry.name.split('_').slice(2).join('_'), 
            path: entry.name 
          });
        }
      }
      return results;
    } catch (e) {
      return [];
    }
  },

  uploadMusic: async () => {
    try {
      const selected = await open({
        multiple: true,
        filters: [{ name: 'Audio', extensions: ['mp3', 'wav', 'ogg'] }]
      });
      if (!selected) return [];
      const paths = Array.isArray(selected) ? selected : [selected];
      
      await ensureDataDir();
      const results = [];
      for (const filePath of paths) {
         const name = await basename(filePath);
         const id = `music_${Date.now()}_${name}`;
         await copyFile(filePath, id, { toPathBaseDir: BaseDirectory.AppLocalData });
         results.push({ name, path: id });
      }
      return results;
    } catch (e) {
      console.error("Failed to upload music", e);
      return [];
    }
  },

  createMusicUrl: async (path) => {
    if (path.startsWith('../../') || path.startsWith('/assets/')) {
      return path; 
    }
    try {
      const localData = await appLocalDataDir();
      const absPath = await join(localData, path);
      return convertFileSrc(absPath);
    } catch (e) {
      console.error("Failed to create music URL", e);
      return path;
    }
  }
};
