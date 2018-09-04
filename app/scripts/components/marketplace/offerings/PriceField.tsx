import * as React from 'react';
import { compose } from 'redux';
import { Field } from 'redux-form';

import { defaultCurrency } from '@waldur/core/services';
import { withTranslation } from '@waldur/i18n';
import { connectPlanComponents } from '@waldur/marketplace/offerings/utils';

import { OfferingPlanFormGroup } from './OfferingPlanFormGroup';

const enhance = compose(connectPlanComponents, withTranslation);

export const PriceField = enhance(props => props.components ? (
  <div className="form-group">
    <label className="control-label col-sm-3">
      {props.translate('Price')}
    </label>
    <div className="col-sm-9">
      <div className="form-control-static">
        {defaultCurrency(props.total)}
      </div>
    </div>
  </div>
) : (
  <Field
    name={`${props.plan}.unit_price`}
    type="number"
    min={0}
    label={props.translate('Price')}
    component={OfferingPlanFormGroup}
  />
));
