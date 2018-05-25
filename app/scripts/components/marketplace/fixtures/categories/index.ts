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
