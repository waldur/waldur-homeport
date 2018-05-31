export interface ProviderInterface {
  name: string;
  country: string;
  latitude: string;
  longitude: string;
  description: string;
  logo: string;
}

export interface Organization {
  name: string;
  country: string;
  latitude: string;
  longitude: string;
  description: string;
  logo: string;
}

export interface Organizations {
  [uuid: string]: Organization;
}

export interface ServiceProviders {
  [uuid: string]: string[];
}

export interface Usage {
  provider_to_consumer: {
    provider_uuid: string;
    consumer_uuid: string;
  };
  data: {
    period: string;
    cpu: number;
    ram: number;
    gpu: number;
  };
}

export interface Feature {
  id: string;
  properties: {
    name: string;
    diff?: number;
  };
  geometry: any;
}

export interface UsageData {
  service_providers: ServiceProviders;
  usage: Usage[];
  organizations: Organizations;
}
