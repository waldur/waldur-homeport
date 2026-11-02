import { useQuery } from '@tanstack/react-query';
import { FC, useEffect } from 'react';
import {
  serviceProviderApiSecretCodeRetrieve,
  ServiceProvider,
} from 'waldur-js-client';

import { PropertyItem, PropertyList } from 'waldur-ui';

import { formatDateTime } from '@/core/dateUtils';
import {
  CommaSeparatedListEditField,
  EditFieldProvider,
  TextEditField,
} from '@/form/editFields';
import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { useNotify } from '@/store/notify';
import { useCustomer } from '@/workspace/hooks';

import { RegenerateSecretCodeButton } from './RegenerateSecretCodeButton';
import { useServiceProviderUpdate } from './useServiceProviderUpdate';

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

  const update = useServiceProviderUpdate(serviceProvider, setServiceProvider);

  if (customer && serviceProvider) {
    return (
      <EditFieldProvider scope={serviceProvider} callback={update}>
        <PropertyList>
          <PropertyItem
            label={translate('API secret code')}
            description={`${translate('Registered at:')} ${formatDateTime(
              serviceProvider.created,
            )}`}
            value={propVal.secret(secretCode?.api_secret_code)}
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
        </PropertyList>
      </EditFieldProvider>
    );
  }
  return null;
};
