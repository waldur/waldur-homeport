import { getItem, removeItem, setItem } from '@waldur/auth/AuthStorage';

export class UserStorage {
  private key: string;

  constructor(key: string, userId: string) {
    this.key = `${key}/${userId}`;
  }

  set(value: object) {
    setItem(this.key, JSON.stringify(value));
  }

  get() {
    const data = getItem(this.key);
    if (data) {
      return JSON.parse(data);
    } else {
      throw new Error('Storage is empty');
    }
  }

  remove() {
    removeItem(this.key);
  }
}
