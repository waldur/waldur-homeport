import { FunctionComponent } from 'react';
import { FormControlStatic } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { formValueSelector } from 'redux-form';

import { translate } from '@waldur/i18n';
import { RESOURCE_ACTION_FORM } from '@waldur/resource/actions/constants';
import { RootState } from '@waldur/store/reducers';

const getAllocationPool = (subnetCidr) => {
  const prefix = subnetCidr.split('.').slice(0, 3).join('.');
  return `${prefix}.10 - ${prefix}.200`;
};

const selector = formValueSelector(RESOURCE_ACTION_FORM);

const cidrSelector = (state: RootState) => selector(state, 'cidr');

export const InternalNetworkAllocationPool: FunctionComponent = () => {
  const cidr = useSelector(cidrSelector);
  const body = cidr ? getAllocationPool(cidr) : <>&mdash;</>;
  return (
    <div className="form-group">
      <label>{translate('Internal network allocation pool')}</label>
      <FormControlStatic>{body}</FormControlStatic>
    </div>
  );
};
