import * as React from 'react';

import { defaultCurrency } from '@waldur/core/services';

import { connectPlanComponents } from './utils';

export const PriceField = connectPlanComponents((props: {total: number}) => (
  <div className="form-control-static">
    {defaultCurrency(props.total)}
  </div>
));
