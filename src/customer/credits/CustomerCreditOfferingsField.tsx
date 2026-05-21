import { FC } from 'react';
import { Field } from 'react-final-form';

import { Select } from '@/form/AsyncSelectField';
import { FormGroup } from '@/form/FormGroup';
import { translate } from '@/i18n';
import { providerOfferingsAutocomplete } from '@/marketplace/common/autocompletes';

export const CustomerCreditOfferingsField: FC = () => {
  return (
    <Field
      name="offerings"
      label={translate('Offering(s)')}
      component={FormGroup}
    >
      <Select
        placeholder={translate('All')}
        loadOptions={(query, prevOptions, page) =>
          providerOfferingsAutocomplete(
            { name: query, billable: true },
            prevOptions,
            page,
          )
        }
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
