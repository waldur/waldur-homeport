import { useQuery } from '@tanstack/react-query';
import { useFormState } from 'react-final-form';
import { remoteWaldurApiRemoteCustomers } from 'waldur-js-client';

import { SHORT_STALE_TIME } from '@/core/constants';
import { required } from '@/core/validators';
import { FormContainerFinal, SelectField } from '@/form';
import { translate } from '@/i18n';

import { ErredRemoteConnection } from './ErredRemoteConnection';
import { OfferingImportFormData } from './types';

export const SelectOrganizationTab = () => {
  const { values: formData } = useFormState<OfferingImportFormData>();
  const {
    isLoading,
    error,
    data: organizations,
  } = useQuery({
    queryKey: ['RemoteOrganizations', formData?.api_url, formData?.token],

    queryFn: () => {
      if (!formData?.api_url || !formData?.token) {
        return Promise.reject(
          new Error(translate('Please check the credentials again.')),
        );
      }
      return remoteWaldurApiRemoteCustomers({ body: formData }).then(
        (r) => r.data,
      );
    },

    staleTime: SHORT_STALE_TIME,
    retry: false,
  });

  return (
    <FormContainerFinal submitting={false} className="size-lg">
      <SelectField
        name="customer"
        label={translate('Organization')}
        description={translate(
          'Found organizations where you are the owner in the remote waldur instance',
        )}
        isLoading={isLoading}
        options={organizations}
        getOptionValue={(option) => option.uuid}
        getOptionLabel={(option) => option.name}
        validate={required}
      />

      {isLoading ? null : error ? (
        <ErredRemoteConnection
          error={error}
          message={translate('Unable to load organizations')}
        />
      ) : organizations?.length === 0 ? (
        <p className="text-danger">
          {translate('There are no organizations yet.')}
        </p>
      ) : null}
    </FormContainerFinal>
  );
};
