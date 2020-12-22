import { FunctionComponent } from 'react';
import { ControlLabel, FormControl, FormGroup } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { InputField } from '@waldur/form/InputField';
import { translate } from '@waldur/i18n';
import { getUser } from '@waldur/workspace/selectors';

import { InputGroup } from './InputGroup';

export const DomainGroup: FunctionComponent = () => {
  const user = useSelector(getUser);
  if (ENV.organizationDomainVisible) {
    return null;
  } else if (user.is_staff) {
    return (
      <InputGroup
        name="domain"
        label={translate('Home organization domain name')}
        component={InputField}
      />
    );
  } else {
    return (
      <FormGroup>
        <ControlLabel>
          {translate('Home organization domain name')}
        </ControlLabel>
        <FormControl.Static>
          <strong>{user.organization || 'N/A'}</strong>
        </FormControl.Static>
      </FormGroup>
    );
  }
};
