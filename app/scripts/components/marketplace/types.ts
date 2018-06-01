export interface Product {
  thumb: string;
  title: string;
  subtitle: string;
  rating: number;
  installs: number;
  reviews: number;
  category?: string;
  vendor: string;
  vendorDetails?: string;
  cloudDeploymentModel?: string;
  vendorType?: string;
  userSupportOptions?: string[];
  interfaceOptions?: string[];
  metricsReporting?: string[];
  dataProtectionInternal?: string;
  dataProtectionExternal?: string;
  userAuth?: string;
  managementAuth?: string;
  securityCertifications?: string;
  pricingOption?: string;
  price: number;
  screenshots?: Screenshot[];
  description?: string;
}

export interface Screenshot {
  thumb: string;
  title: string;
  description: string;
}

export interface Feature {
  title: string;
  key: string;
  render?: React.SFC<any>;
}

export interface Section {
  title: string;
  features: Feature[];
}

export interface Category {
  title: string;
  icon: string;
  children?: Category[];
  counter: number;
}
