import "@testing-library/jest-dom";

// LocalStorage mock to handle Node.js experimental localStorage issues
class LocalStorageMock {
  private store: Record<string, string> = {};

  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }

  removeItem(key: string) {
    delete this.store[key];
  }

  get length() {
    return Object.keys(this.store).length;
  }

  key(index: number) {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }
}

const mockLocalStorage = new LocalStorageMock();

// Define localStorage on globalThis if not defined or if it's the experimental Node one
try {
  Object.defineProperty(globalThis, "localStorage", {
    value: mockLocalStorage,
    writable: true,
    configurable: true,
  });
} catch (e) {
  console.warn("Could not redefine globalThis.localStorage, falling back to window", e);
}

try {
  Object.defineProperty(window, "localStorage", {
    value: mockLocalStorage,
    writable: true,
    configurable: true,
  });
} catch (e) {
  // window might not exist if environment is not jsdom in some files
}
