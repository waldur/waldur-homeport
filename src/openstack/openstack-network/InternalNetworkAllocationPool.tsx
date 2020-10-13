import * as React from 'react';
import * as FormControlStatic from 'react-bootstrap/lib/FormControlStatic';
import { useSelector } from 'react-redux';
import { formValueSelector } from 'redux-form';

import { translate } from '@waldur/i18n';
import { RESOURCE_ACTION_FORM } from '@waldur/resource/actions/ResourceActionDialog';

const getAllocationPool = (subnetCidr) => {
  const prefix = subnetCidr.split('.').slice(0, 3).join('.');
  return `${prefix}.10 - ${prefix}.200`;
};

const selector = formValueSelector(RESOURCE_ACTION_FORM);

const cidrSelector = (state) => selector(state, 'cidr');

export const InternalNetworkAllocationPool = () => {
  const cidr = useSelector(cidrSelector);
  const body = cidr ? getAllocationPool(cidr) : <>&mdash;</>;
  return (
    <div className="form-group">
      <label>{translate('Internal network allocation pool')}</label>
      <FormControlStatic>{body}</FormControlStatic>
    </div>
  );
};
