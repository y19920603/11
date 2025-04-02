export const LOCA_EMAIL = "email";
export const LOCA_PASSWORD = "password";

export const Loca = {
  get: function <T>(key: string): T | null {
    let value = localStorage.getItem(key);
    if (value !== null && value !== "") {
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as unknown as T;
      }
    }
    return null;
  },

  set: function (key: string, value: any): void {
    if (typeof value === "object" && value !== null) {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      localStorage.setItem(key, value);
    }
  },

  remove: function (key: string | string[]): void {
    if (Array.isArray(key)) {
      key.forEach((k) => localStorage.removeItem(k));
    } else {
      localStorage.removeItem(key);
    }
  },
};
