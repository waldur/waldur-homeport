import { defaultCurrency } from '@waldur/core/formatCurrency';

import { connectPlanComponents } from './utils';

export const PriceField = connectPlanComponents((props: { total: number }) => (
  <div className="form-control-static">{defaultCurrency(props.total)}</div>
));
