import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';

import { WizardModal, WizardStepProps } from 'waldur-wizard';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { required } from '@/core/validators';
import { AsyncSelectGroup, SelectGroup, StringGroup } from '@/form';
import { translate } from '@/i18n';
import { getCategories } from '@/marketplace/common/api';
import { organizationAutocomplete } from '@/marketplace/common/autocompletes';

export const BasicsStep: FC<WizardStepProps> = (props) => {
  const showProvider = Boolean(props.data?.showProvider);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['marketplace-categories-all'],
    queryFn: getCategories,
    refetchOnWindowFocus: false,
  });
  const loadOrganizations = useMemo(
    () =>
      organizationAutocomplete({
        field: ['name', 'url', 'uuid'],
        o: 'name',
        is_service_provider: true,
      }),
    [],
  );

  return (
    <WizardModal {...props}>
      {showProvider && (
        <AsyncSelectGroup
          name="organisation"
          label={translate('Service provider')}
          validate={required}
          required
          placeholder={translate('Select service provider...')}
          loadOptions={loadOrganizations}
          getOptionLabel={(option) => option.name}
          getOptionValue={(option) => option.url}
          noOptionsMessage={() => translate('No service providers')}
          isClearable={true}
        />
      )}
      <StringGroup
        name="name"
        label={translate('Name')}
        required
        validate={required}
        maxLength={150}
        data-testid="template-offering-name"
      />
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred
          message={translate('Unable to load categories.')}
          loadData={refetch}
        />
      ) : (
        <SelectGroup
          name="category"
          label={translate('Category')}
          options={data}
          required
          getOptionValue={(option) => option.url}
          getOptionLabel={(option) => option.title}
          isClearable={false}
          validate={required}
          spaceless
          data-testid="template-offering-category"
        />
      )}
    </WizardModal>
  );
};
