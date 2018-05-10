import { Product } from '../types';

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

export const products: Product[] = [
  {
    title: 'Salesforce CRM',
    subtitle: 'It covers every customer touch point and every stage of the customer lifecycle.',
    thumb: SalesForceIcon,
    rating: 5,
    installs: 100,
  },
  {
    title: 'Redtail CRM',
    subtitle: 'Web-based, full-featured and easy-to-use client management solution designed specifically for financial professionals.',
    thumb: RedtailIcon,
    rating: 3,
    installs: 200,
  },
  {
    title: 'Zoho CRM',
    subtitle: 'Reach out to prospects at the right moment and engage them across every channel. Zoho CRM helps businesses of all sizes close more deals the smarter way.',
    thumb: ZohoIcon,
    rating: 3,
    installs: 300,
  },
  {
    title: 'Microsoft Dynamics 365',
    subtitle: 'Unify CRM and ERP capabilities and break down data silos with Dynamics 365—modern, intelligent cloud applications that help move your business forward.',
    thumb: Dynamics365Icon,
    rating: 5,
    installs: 40,
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
