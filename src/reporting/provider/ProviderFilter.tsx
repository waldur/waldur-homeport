import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Field, reduxForm } from 'redux-form';

import { AsyncPaginate } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { providerAutocomplete } from '@waldur/marketplace/common/autocompletes';

interface ProviderFilterProps {
  // From redux-form
  change?: (field: string, value: unknown) => void;
}

const PureProviderFilter: FC<ProviderFilterProps> = () => (
  <Row className="mb-6 g-3">
    <Col xs={12} sm={6} md={4}>
      <Field
        name="provider"
        component={(fieldProps) => (
          <AsyncPaginate
            placeholder={translate('Select provider...')}
            loadOptions={providerAutocomplete}
            defaultOptions
            getOptionValue={(option) => option.uuid}
            getOptionLabel={(option) => option.customer_name}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            noOptionsMessage={() => translate('No providers')}
            isClearable={true}
            className="metronic-select-container"
            classNamePrefix="metronic-select"
          />
        )}
      />
    </Col>
  </Row>
);

export const ProviderFilter = reduxForm({
  form: 'ProviderReportingFilter',
  destroyOnUnmount: false,
})(PureProviderFilter);
