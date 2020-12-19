import { FunctionComponent } from 'react';
import { Col, ControlLabel, FormGroup } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import { getUser } from '@waldur/workspace/selectors';

import { SelectField } from './SelectField';

export const PriorityGroup: FunctionComponent<{ priorities; disabled }> = ({
  priorities,
  disabled,
}) => {
  const user = useSelector(getUser);
  if (!user || (!user.is_staff && !user.is_support)) {
    return null;
  }
  return (
    <FormGroup>
      <Col sm={3} componentClass={ControlLabel}>
        {translate('Priority')}
      </Col>
      <Col sm={6}>
        <Field
          name="priority"
          component={SelectField}
          placeholder={translate('Select priority...')}
          options={priorities}
          isDisabled={disabled}
          getOptionValue={(option) => option.name}
          getOptionLabel={(option) => option.name}
          isClearable={true}
        />
      </Col>
    </FormGroup>
  );
};
