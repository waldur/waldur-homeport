import { FC, useMemo } from 'react';
import { Field } from 'react-final-form';

import { FormGroup } from '@/form/FormGroup';
import { AsyncSelect as Select } from '@/form/select';
import { translate } from '@/i18n';
import { providerOfferingsAutocomplete } from '@/marketplace/common/autocompletes';

export const CustomerCreditOfferingsField: FC = () => {
  const loadOfferings = useMemo(
    () => providerOfferingsAutocomplete({ billable: true }),
    [],
  );

  return (
    <Field
      name="offerings"
      label={translate('Offering(s)')}
      component={FormGroup}
    >
      <Select
        placeholder={translate('All')}
        loadOptions={loadOfferings}
        isMulti
        getOptionValue={(option) => option.uuid}
        getOptionLabel={(option) =>
          option.category_title
            ? `${option.category_title} / ${option.name}`
            : option.name
        }
        noOptionsMessage={() => translate('No offerings')}
      />
    </Field>
  );
};
