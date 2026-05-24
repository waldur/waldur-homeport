import { FC, useMemo } from 'react';
import { Field } from 'react-final-form';

import { AsyncSelect } from '@/form/select';
import { translate } from '@/i18n';
import { resourceAutocomplete } from '@/marketplace/common/autocompletes';
import { formatResourceShort } from '@/marketplace/utils';

export const ResourceAutocomplete: FC<{}> = () => {
  const loadOptions = useMemo(
    () =>
      resourceAutocomplete({
        field: ['name', 'url', 'uuid', 'offering_name'],
      }),
    [],
  );

  const renderField = (fieldProps) => (
    <AsyncSelect
      placeholder={translate('Select resource...')}
      loadOptions={loadOptions}
      getOptionValue={(option) => option.uuid}
      getOptionLabel={(option) => formatResourceShort(option)}
      value={fieldProps.input.value}
      onChange={(value) => fieldProps.input.onChange(value)}
      noOptionsMessage={() => translate('No resources')}
      isClearable={true}
      variant="tableFilter"
    />
  );

  return <Field name="resource" component={renderField} />;
};
