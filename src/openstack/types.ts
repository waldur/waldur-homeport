export interface Quota {
  name: string;
  limit: number;
  usage: number;
  limitType?: string;
  required?: number;
}
