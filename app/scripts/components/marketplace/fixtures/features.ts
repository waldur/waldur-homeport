import { randomChoice, randomChoiceList } from '@waldur/core/fixtures';

// tslint:disable
const ProductDescription = require('./product-description.md');
const OpenNodeVendor = require('./vendor-details.md');
import { WaldurScreenshots } from './screenshots';

const CLOUD_DEPLOYMENT_MODELS = [
  'Public cloud',
  'Private cloud',
  'Community cloud',
  'Hybrid cloud',
];

const VENDOR_TYPES = [
  'Not a reseller',
  'Reseller providing extra features and support',
  'Reseller providing extra support',
  'Reseller (no extras)',
];

const USER_SUPPORT_CHOICES = [
  'Email or online ticketing',
  'Phone',
  'Web chat',
  'Onsite support',
];

const INTERFACE_OPTIONS = [
  'Web browser interface',
  'Application to install',
  'Mobile devices',
  'API',
];

const METRICS_REPORTING = [
  'API access',
  'Real-time dashboards',
  'Regular reports',
  'Reports on request',
];

const DATA_PROTECTION_CHOICES = [
  'Private network or public sector network',
  'TLS (version 1.2 or above)',
  'IPsec or TLS VPN gateway',
  'Bonded fibre optic connections',
];

const USER_AUTH_CHOICES = [
  '2-factor authentication',
  'Public key authentication (including by TLS client certificate)',
  'Identity federation with existing provider (for example Google Apps)',
  'Limited access network (for example PSN)',
  'Dedicated link (for example VPN)',
  'Username or password',
];

const SECURITY_CERTIFICATION_CHOICES = [
  'ISO/IEC 27001 (service security)',
  'ISO 28000:2007 (supply chain security)',
  'CSA STAR (service security)',
  'PCI DSS (payment card security)',
];

const PRICING_OPTIONS = [
  'No free trial',
  'Free trial',
  'Discount for educational organisations',
];

export const fillFeatures = product => ({
  ...product,
  cloudDeploymentModel: randomChoice(CLOUD_DEPLOYMENT_MODELS),
  vendorType: randomChoice(VENDOR_TYPES),
  userSupportOptions: randomChoiceList(USER_SUPPORT_CHOICES),
  interfaceOptions: randomChoiceList(INTERFACE_OPTIONS),
  metricsReporting: randomChoiceList(METRICS_REPORTING),
  dataProtectionInternal: randomChoice(DATA_PROTECTION_CHOICES),
  dataProtectionExternal: randomChoice(DATA_PROTECTION_CHOICES),
  userAuth: randomChoice(USER_AUTH_CHOICES),
  managementAuth: randomChoice(USER_AUTH_CHOICES),
  securityCertifications: randomChoice(SECURITY_CERTIFICATION_CHOICES),
  pricingOption: randomChoice(PRICING_OPTIONS),
  screenshots: WaldurScreenshots,
  vendorDetails: OpenNodeVendor,
  description: ProductDescription,
  category: 'CRM / ERP',
});
