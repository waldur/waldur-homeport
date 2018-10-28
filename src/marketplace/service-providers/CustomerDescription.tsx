import * as React from 'react';

import { Customer } from '@waldur/customer/types';
import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogo';

import './CustomerDescription.scss';

interface CustomerDescriptionProps {
  customer: Customer;
}

export const CustomerDescription = (props: CustomerDescriptionProps) => (
  <div className="customer-description">
    <div className="customer-description__logo">
      <OfferingLogo src={props.customer.image}/>
    </div>
  </div>
);
