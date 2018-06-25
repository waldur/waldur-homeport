import { Category } from '@waldur/marketplace/types';

// tslint:disable
const BillingIcon = require('./category-billing.svg');
const CrmIcon = require('./category-crm.svg');
const HpcIcon = require('./category-hpc.svg');
const IdentityIcon = require('./category-identity.svg');
const PublicCloudIcon = require('./category-public-cloud.svg');
const ServiceDeskIcon = require('./category-service-desk.svg');
const VpcIcon = require('./category-vpc.svg');

export const categories: Category[] = [
  {
    icon: BillingIcon,
    title: 'Billing',
    offering_count: 90,
  },
  {
    icon: CrmIcon,
    title: 'Customer relationship management',
    offering_count: 100,
  },
  {
    icon: HpcIcon,
    title: 'High performance computing',
    offering_count: 50,
  },
  {
    icon: IdentityIcon,
    title: 'Identity management',
    offering_count: 10,
  },
  {
    icon: PublicCloudIcon,
    title: 'Public cloud',
    offering_count: 300,
  },
  {
    icon: ServiceDeskIcon,
    title: 'Service desk',
    offering_count: 1000,
  },
  {
    icon: VpcIcon,
    title: 'Virtual private cloud',
    offering_count: 100,
  },
];
