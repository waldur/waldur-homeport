import { useQuery } from '@tanstack/react-query';
import { FC, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  marketplaceServiceProvidersPartialUpdate,
  serviceProviderApiSecretCodeRetrieve,
} from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { StaffOnlyIndicator } from '@/core/StaffOnlyIndicator';
import { FieldEditButton } from '@/customer/details/FieldEditButton';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { ServiceProvider } from '@/marketplace/types';
import { useNotify } from '@/store/notify';
import { renderFieldOrDash } from '@/table/utils';
import { getCustomer, isStaff } from '@/workspace/selectors';

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

  const customer = useSelector(getCustomer);
  const isStaffUser = useSelector(isStaff);

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
        error as any,
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

        <FormTable.Item
          label={translate('Description')}
          value={renderFieldOrDash(serviceProvider?.description)}
          actions={
            <FieldEditButton
              customer={serviceProvider}
              name="description"
              callback={update}
            />
          }
        />

        <FormTable.Item
          label={translate('Allowed domains')}
          value={renderFieldOrDash(
            (serviceProvider?.allowed_domains as string[])?.join(', '),
          )}
          actions={
            <>
              <StaffOnlyIndicator />
              {isStaffUser && (
                <FieldEditButton
                  customer={serviceProvider}
                  name="allowed_domains"
                  callback={update}
                />
              )}
            </>
          }
        />
      </FormTable>
    );
  }
  return null;
};
