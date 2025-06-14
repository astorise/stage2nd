import localforage from 'localforage';

export class StorageService {
  constructor() {
    this.store = localforage.createInstance({
      name: 'codeplay',
      version: 1.0,
      storeName: 'codeplay_data',
      description: 'CodePlay local storage'
    });
  }
  
  async set(key, value) {
    try {
      await this.store.setItem(key, value);
      return true;
    } catch (error) {
      console.error('Erreur de sauvegarde:', error);
      return false;
    }
  }
  
  async get(key, defaultValue = null) {
    try {
      const value = await this.store.getItem(key);
      return value !== null ? value : defaultValue;
    } catch (error) {
      console.error('Erreur de lecture:', error);
      return defaultValue;
    }
  }
  
  async remove(key) {
    try {
      await this.store.removeItem(key);
      return true;
    } catch (error) {
      console.error('Erreur de suppression:', error);
      return false;
    }
  }
  
  async clear() {
    try {
      await this.store.clear();
      return true;
    } catch (error) {
      console.error('Erreur de nettoyage:', error);
      return false;
    }
  }
  
  async getAll() {
    const keys = await this.store.keys();
    const data = {};
    
    for (const key of keys) {
      data[key] = await this.get(key);
    }
    
    return data;
  }
}
