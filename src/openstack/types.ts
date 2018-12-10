export interface Quota {
  name: string;
  limit: number;
  usage: number;
  required?: number;
}
