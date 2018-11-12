export class UserStorage {
  private key: string;

  constructor(key: string, userId: string) {
    this.key = `${key}/${userId}`;
  }

  set(value: object) {
    sessionStorage.setItem(this.key, JSON.stringify(value));
  }

  get() {
    const data = sessionStorage.getItem(this.key);
    if (data) {
      return JSON.parse(data);
    } else {
      throw new Error('Storage is empty');
    }
  }

  remove() {
    sessionStorage.removeItem(this.key);
  }
}
