// Browser-based Key-Value storage implementation
// Uses localStorage for persistence across sessions

class KVStorage {
  private prefix = "careconnect_";

  async get<T>(key: string): Promise<T | undefined> {
    try {
      const value = localStorage.getItem(this.prefix + key);
      return value ? JSON.parse(value) : undefined;
    } catch (error) {
      console.error(`Error getting key ${key}:`, error);
      return undefined;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting key ${key}:`, error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error(`Error deleting key ${key}:`, error);
    }
  }

  async keys(): Promise<string[]> {
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keys.push(key.substring(this.prefix.length));
        }
      }
      return keys;
    } catch (error) {
      console.error("Error getting keys:", error);
      return [];
    }
  }
}

// Create a global instance
export const kv = new KVStorage();

// Make it available globally for legacy code
if (typeof window !== "undefined") {
  (window as any).kv = kv;
}
