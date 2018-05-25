import { Product } from '../../types';

// tslint:disable
const ZohoIcon = require('./zoho-crm.svg'); 
const SalesForceIcon = require('./salesforce-crm.svg');
const RedtailIcon = require('./redtail-crm.png');
const Dynamics365Icon = require('./microsoft-dynamics-365.png');

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
