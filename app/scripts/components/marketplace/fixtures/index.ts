import { randomChoice, randomChoiceList } from '@waldur/core/fixtures';

import { Product } from '../types';
import { ListCell } from './ListCell';

// tslint:disable
const ZohoIcon = require('./zoho-crm.svg'); 
const SalesForceIcon = require('./salesforce-crm.svg');
const RedtailIcon = require('./redtail-crm.png');
const Dynamics365Icon = require('./microsoft-dynamics-365.png');

const BillingIcon = require('./category-billing.svg');
const CrmIcon = require('./category-crm.svg');
const HpcIcon = require('./category-hpc.svg');
const IdentityIcon = require('./category-identity.svg');
const PublicCloudIcon = require('./category-public-cloud.svg');
const ServiceDeskIcon = require('./category-service-desk.svg');
const VpcIcon = require('./category-vpc.svg');

const HomePort01 = require('./homeport-01.png');
const HomePort02 = require('./homeport-02.png');
const HomePort03 = require('./homeport-03.png');
const HomePort04 = require('./homeport-04.png');
const HomePort05 = require('./homeport-05.png');
const HomePort06 = require('./homeport-06.png');

const ProductDescription = require('./product-description.md');
const OpenNodeVendor = require('./vendor-details.md');

const WaldurScreenshots = [
  {
    thumb: HomePort01,
    title: 'Organization management',
    description: 'Waldur HomePort splits management functionality into workspaces that are used by users in corresponding roles.',
  },
  {
    thumb: HomePort02,
    title: 'Resource management',
    description: 'Waldur supports management of resources from both public and private cloud providers through a single pane of control.',
  },
  {
    thumb: HomePort03,
    title: 'Team management',
    description: 'Оrganization and project teams management is done with invites-based delegations. Allows to maintain full control over access grants while streamlining operations.',
  },
  {
    thumb: HomePort04,
    title: 'Provider management',
    description: 'Service provider management provides detailed information about certifications and terms of services of a particular solution, as well as allows to see prices and SLA terms.',
  },
  {
    thumb: HomePort05,
    title: 'Resource provisioning',
    description: 'Service Store allows to provision resources from the available service providers that match policy configurations for a particular project. Service Store offers a common provisioning flow for heterogeneous cloud providers.',
  },
  {
    thumb: HomePort06,
    title: 'Resource provisioning',
    description: 'Service Store allows to provision resources from the available service providers that match policy configurations for a particular project. Service Store offers a common provisioning flow for heterogeneous cloud providers.',
  },
];

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

export const products: Product[] = [
  {
    title: 'Salesforce CRM',
    subtitle: 'It covers every customer touch point and every stage of the customer lifecycle.',
    thumb: SalesForceIcon,
    rating: 5,
    reviews: 14,
    installs: 100,
    vendor: 'Salesforce.com',
    price: 900,
  },
  {
    title: 'Redtail CRM',
    subtitle: 'Web-based, full-featured and easy-to-use client management solution designed specifically for financial professionals.',
    thumb: RedtailIcon,
    rating: 3,
    reviews: 20,
    installs: 200,
    vendor: 'Redtail Technology',
    price: 300,
  },
  {
    title: 'Zoho CRM',
    subtitle: 'Reach out to prospects at the right moment and engage them across every channel. Zoho CRM helps businesses of all sizes close more deals the smarter way.',
    thumb: ZohoIcon,
    rating: 3,
    reviews: 10,
    installs: 300,
    vendor: 'Zoho Corporation',
    price: 400,
  },
  {
    title: 'Dynamics 365',
    subtitle: 'Unify CRM and ERP capabilities and break down data silos with Dynamics 365—modern, intelligent cloud applications that help move your business forward.',
    thumb: Dynamics365Icon,
    rating: 5,
    reviews: 30,
    installs: 40,
    vendor: 'Microsoft',
    price: 1000,
  },
];

export const categories = [
  {
    icon: BillingIcon,
    title: 'Billing',
    counter: 90,
  },
  {
    icon: CrmIcon,
    title: 'Customer relationship management',
    counter: 100,
  },
  {
    icon: HpcIcon,
    title: 'High performance computing',
    counter: 50,
  },
  {
    icon: IdentityIcon,
    title: 'Identity management',
    counter: 10,
  },
  {
    icon: PublicCloudIcon,
    title: 'Public cloud',
    counter: 300,
  },
  {
    icon: ServiceDeskIcon,
    title: 'Service desk',
    counter: 1000,
  },
  {
    icon: VpcIcon,
    title: 'Virtual private cloud',
    counter: 100,
  },
];

for(const product of products) {
  product.cloudDeploymentModel = randomChoice(CLOUD_DEPLOYMENT_MODELS);
  product.vendorType = randomChoice(VENDOR_TYPES);
  product.userSupportOptions = randomChoiceList(USER_SUPPORT_CHOICES);
  product.interfaceOptions = randomChoiceList(INTERFACE_OPTIONS);
  product.metricsReporting = randomChoiceList(METRICS_REPORTING);
  product.dataProtectionInternal = randomChoice(DATA_PROTECTION_CHOICES);
  product.dataProtectionExternal = randomChoice(DATA_PROTECTION_CHOICES);
  product.userAuth = randomChoice(USER_AUTH_CHOICES);
  product.managementAuth = randomChoice(USER_AUTH_CHOICES);
  product.securityCertifications = randomChoice(SECURITY_CERTIFICATION_CHOICES);
  product.pricingOption = randomChoice(PRICING_OPTIONS);
  product.screenshots = WaldurScreenshots;
  product.vendorDetails = OpenNodeVendor;
  product.description = ProductDescription;
  product.category = 'CRM / ERP';
}

export const sections = [
  {
    title: 'Summary',
    features: [
      {
        key: 'pricingOption',
        title: 'Pricing options',
      },
      {
        key: 'installs',
        title: 'Installation count',
      },
      {
        key: 'cloudDeploymentModel',
        title: 'Cloud deployment model'
      },
      {
        key: 'vendorType',
        title: 'Supplier type',
      },
    ],
  },
  {
    title: 'Access and support',
    features: [
      {
        key: 'userSupportOptions',
        title: 'User support',
        render: ListCell,
      },
      {
        key: 'interfaceOptions',
        title: 'Using the service',
        render: ListCell,
      },
      {
        key: 'metricsReporting',
        title: 'Metrics reporting',
        render: ListCell,
      },
    ]
  },
  {
    title: 'Security',
    features: [
      {
        key: 'dataProtectionExternal',
        title: 'Data protection between buyer and supplier networks',
      },
      {
        key: 'dataProtectionInternal',
        title: 'Data protection within supplier network'
      },
      {
        key: 'userAuth',
        title: 'User authentication'
      },
      {
        key: 'managementAuth',
        title: 'Management access authentication',
      },
      {
        key: 'securityCertifications',
        title: 'Security certification'
      }
    ],
  },
];
