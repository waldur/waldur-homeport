import { useQuery } from '@tanstack/react-query';
import { FC, useEffect } from 'react';
import {
  marketplaceServiceProvidersPartialUpdate,
  serviceProviderApiSecretCodeRetrieve,
  ServiceProvider,
} from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import {
  CommaSeparatedListEditField,
  EditFieldProvider,
  TextEditField,
} from '@/form/editFields';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';
import { useCustomer } from '@/workspace/hooks';

import { SecretValueField } from '../SecretValueField';

import { RegenerateSecretCodeButton } from './RegenerateSecretCodeButton';

interface OwnProps {
  serviceProvider: ServiceProvider;
  setServiceProvider(data: ServiceProvider): void;
}

export const ServiceProviderManagement: FC<OwnProps> = ({
  serviceProvider,
  setServiceProvider,
}) => {
  const { showErrorResponse } = useNotify();

  const customer = useCustomer();

  const { data: secretCode, error } = useQuery({
    queryKey: ['ServiceProviderSecretCode', serviceProvider?.uuid],

    queryFn: () =>
      serviceProvider?.uuid
        ? serviceProviderApiSecretCodeRetrieve({
            path: { uuid: serviceProvider.uuid },
          }).then((r) => r.data)
        : null,

    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (error) {
      showErrorResponse(
        error,
        translate('Unable to retrieve service provider API secret code.'),
      );
    }
  }, [error]);

  const update = async (formData) => {
    try {
      const res = await marketplaceServiceProvidersPartialUpdate({
        path: { uuid: serviceProvider.uuid },
        body: formData,
      });
      setServiceProvider(res.data);
      return res;
    } catch (error) {
      showErrorResponse(error);
      throw error;
    }
  };

  if (customer && serviceProvider) {
    return (
      <EditFieldProvider scope={serviceProvider} callback={update}>
        <FormTable>
          <FormTable.Item
            label={translate('API secret code')}
            description={`${translate('Registered at:')} ${formatDateTime(
              serviceProvider.created,
            )}`}
            value={
              <SecretValueField
                value={secretCode?.api_secret_code}
                className="mw-300px"
              />
            }
            actions={
              <RegenerateSecretCodeButton serviceProvider={serviceProvider} />
            }
          />

          <TextEditField name="description" label={translate('Description')} />

          <CommaSeparatedListEditField
            name="allowed_domains"
            label={translate('Allowed domains')}
            placeholder={translate('Enter domains separated by commas')}
            description={translate(
              'List of allowed domains for offering endpoints.',
            )}
            isStaffOnly
          />
        </FormTable>
      </EditFieldProvider>
    );
  }
  return null;
};
