export interface Product {
  thumb: string;
  title: string;
  subtitle: string;
  rating: number;
  installs: number;
  reviews: number;
  vendor: string;
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
