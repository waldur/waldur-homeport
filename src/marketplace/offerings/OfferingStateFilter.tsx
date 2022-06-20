import { FunctionComponent } from 'react';
import { Col, Form } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Field } from 'redux-form';

import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import './OfferingsStateFilter.scss';

export const getStates = () => [
  { value: 'Draft', label: translate('Draft') },
  { value: 'Active', label: translate('Active') },
  { value: 'Paused', label: translate('Paused') },
  { value: 'Archived', label: translate('Archived') },
];

export const OfferingStateFilter: FunctionComponent = () => {
  const { theme } = useSelector((state: RootState) => state.theme);
  return (
    <Col sm={3} className={'state_filter_container ' + theme}>
      <Form.Label>{translate('State')}</Form.Label>
      <Field
        name="state"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Select state...')}
            options={getStates()}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            isMulti={true}
            isClearable={true}
          />
        )}
      />
    </Col>
  );
};
