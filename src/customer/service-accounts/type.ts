import { Customer, Project } from 'waldur-js-client';

export interface ServiceAccountsProps {
  scope?: Project | Customer;
  context: 'project' | 'customer';
}
