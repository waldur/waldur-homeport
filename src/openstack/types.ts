export interface Quota {
  name: string;
  limit: number;
  usage: number;
  limitType?: string;
  required?: number;
}

export interface AvailabilityZone {
  url: string;
  name: string;
}

export interface VolumeType {
  url: string;
  name: string;
  description: string;
  is_default: boolean;
}
