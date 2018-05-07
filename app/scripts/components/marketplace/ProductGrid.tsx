import * as React from 'react';

import { range } from '@waldur/core/utils';
import { connectAngularComponent } from '@waldur/store/connect';

import { ProductCard } from './ProductCard';

const ZohoIcon = require('./zoho-crm.svg'); // tslint:disable-line
const SalesForceIcon = require('./salesforce-crm.svg'); // tslint:disable-line
const RedtailIcon = require('./redtail-crm.png'); // tslint:disable-line

const products = [
  {
    thumb: SalesForceIcon,
    rating: 5,
    category: 'Customer relationship management systems',
    title: 'Salesforce CRM',
    price: 300,
  },
  {
    thumb: RedtailIcon,
    rating: 3,
    category: 'Customer relationship management systems',
    title: 'Redtail CRM',
    price: 200,
  },
  {
    thumb: ZohoIcon,
    rating: 3,
    category: 'Customer relationship management systems',
    title: 'Zoho CRM',
    price: 400,
  },
  {
    thumb: SalesForceIcon,
    rating: 5,
    category: 'Customer relationship management systems',
    title: 'Salesforce CRM',
    price: 300,
  },
];

const ProductGrid = () => (
  <div className="row">
    {range(12).map(index => (
      <div key={index} className="col-md-3 col-sm-6">
        <ProductCard {...products[index % products.length]}/>
      </div>
    ))}
  </div>
);

export default connectAngularComponent(ProductGrid);
