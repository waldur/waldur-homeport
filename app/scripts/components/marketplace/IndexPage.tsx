import * as React from 'react';

import { connectAngularComponent } from '@waldur/store/connect';

import { ProductCategory } from './ProductCategory';

const ZohoIcon = require('./zoho-crm.svg'); // tslint:disable-line
const SalesForceIcon = require('./salesforce-crm.svg'); // tslint:disable-line
const RedtailIcon = require('./redtail-crm.png'); // tslint:disable-line
const Dynamics365Icon = require('./microsoft-dynamics-365.png'); // tslint:disable-line

const products = [
  {
    title: 'Salesforce CRM',
    subtitle: 'It covers every customer touch point and every stage of the customer lifecycle.',
    thumb: SalesForceIcon,
    rating: 5,
  },
  {
    title: 'Redtail CRM',
    subtitle: 'Web-based, full-featured and easy-to-use client management solution designed specifically for financial professionals.',
    thumb: RedtailIcon,
    rating: 3,
  },
  {
    title: 'Zoho CRM',
    subtitle: 'Reach out to prospects at the right moment and engage them across every channel. Zoho CRM helps businesses of all sizes close more deals the smarter way.',
    thumb: ZohoIcon,
    rating: 3,
  },
  {
    title: 'Microsoft Dynamics 365',
    subtitle: 'Unify CRM and ERP capabilities and break down data silos with Dynamics 365—modern, intelligent cloud applications that help move your business forward.',
    thumb: Dynamics365Icon,
    rating: 5,
  },
];

const categories = [
  {
    header: 'Staff picks',
    subheader: `Try out any of these apps curated by our team for free.`,
    products,
  },
  {
    header: 'Monitoring',
    subheader: `Measure performance, track errors, and analyze your application.`,
    products,
  },
];

export const IndexPage = () => categories.map((category, index) => (
  <ProductCategory category={category} key={index}/>
));

export default connectAngularComponent(IndexPage);
