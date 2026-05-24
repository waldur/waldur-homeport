import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';

import { AsyncSelect } from '@/form/select';
import { translate } from '@/i18n';
import { providerAutocomplete } from '@/marketplace/common/autocompletes';

export const ServiceProviderAutocomplete: FunctionComponent<{}> = () => {
  const renderComponent = (fieldProps) => (
    <AsyncSelect
      placeholder={translate('Select organization...')}
      loadOptions={providerAutocomplete}
      defaultOptions
      getOptionValue={(option) => option.customer_uuid}
      getOptionLabel={(option) => option.customer_name}
      value={fieldProps.input.value}
      onChange={(value) => fieldProps.input.onChange(value)}
      noOptionsMessage={() => translate('No organizations')}
      isClearable={true}
      variant="tableFilter"
    />
  );

  return <Field name="organization" component={renderComponent} />;
};
