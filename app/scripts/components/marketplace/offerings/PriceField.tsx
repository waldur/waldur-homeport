import * as React from 'react';
import { compose } from 'redux';
import { Field } from 'redux-form';

import { defaultCurrency } from '@waldur/core/services';
import { withTranslation } from '@waldur/i18n';
import { connectPlanComponents } from '@waldur/marketplace/offerings/utils';

const enhance = compose(connectPlanComponents, withTranslation);

export const PriceField = enhance(props =>
  props.components ? (
    <div className="form-control-static">
      {defaultCurrency(props.total)}
    </div>
  ) : (
    <Field
      name={`${props.plan}.unit_price`}
      type="number"
      min={0}
      component="input"
      className="form-control"
    />
  )
);
