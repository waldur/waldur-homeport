import { FC } from 'react';
import { Field, useFormState } from 'react-final-form';

import { AsyncSelectField } from '@/form/select/AsyncSelectField';
import { StringField } from '@/form/StringField';
import { translate } from '@/i18n';
import { providerAutocomplete } from '@/marketplace/common/autocompletes';
import { OfferingAutocomplete } from '@/marketplace/offerings/details/OfferingAutocomplete';
import { OfferingTypeAutocomplete } from '@/marketplace/offerings/details/OfferingTypeAutocomplete';
import { TableFilterItem } from '@/table/TableFilterItem';

export const COMPONENT_USAGE_FILTER_FORM_ID = 'OfferingComponentUsageFilter';

export const OfferingComponentUsageFilter: FC = () => {
  const { values } = useFormState();
  const provider = values?.provider;

  return (
    <>
      <TableFilterItem
        title={translate('Service provider')}
        name="provider"
        badgeValue={(value) => value?.customer_name}
      >
        <AsyncSelectField
          name="provider"
          placeholder={translate('Select service provider...')}
          loadOptions={providerAutocomplete}
          getOptionLabel={({ customer_name }) => customer_name}
          getOptionValue={({ customer_uuid }) => customer_uuid}
          variant="tableFilter"
        />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Offering')}
        name="offering"
        badgeValue={(value) => value?.name}
      >
        <OfferingAutocomplete
          name="offering"
          offeringFilter={
            provider ? { customer_uuid: provider.customer_uuid } : {}
          }
          reactSelectProps={{ variant: 'tableFilter' }}
        />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Integration type')}
        name="offering_type"
        badgeValue={(value) => value?.label}
      >
        <OfferingTypeAutocomplete
          reactSelectProps={{ variant: 'tableFilter' }}
        />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Component type')}
        name="component_type"
      >
        <Field
          name="component_type"
          component={StringField}
          placeholder={translate('Enter component type...')}
        />
      </TableFilterItem>
    </>
  );
};
