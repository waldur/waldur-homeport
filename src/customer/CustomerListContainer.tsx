import * as React from 'react';

import { CustomerListFilter } from '@waldur/customer/CustomerListFilter';
import { connectAngularComponent } from '@waldur/store/connect';

import { CustomerList } from './CustomerList';
import { TotalCostContainer } from './TotalCostComponent';

export const CustomerListComponent = () => (
  <>
    <CustomerListFilter />
    <div className="ibox-content">
      <CustomerList />
      <TotalCostContainer/>
    </div>
  </>
);

export default connectAngularComponent(CustomerListComponent);
