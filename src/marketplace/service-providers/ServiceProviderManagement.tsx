import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SubmissionError } from 'redux-form';
import {
  marketplaceServiceProvidersPartialUpdate,
  serviceProviderApiSecretCodeGenerate,
  serviceProviderApiSecretCodeRetrieve,
} from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { StaffOnlyIndicator } from '@/core/StaffOnlyIndicator';
import { FieldEditButton } from '@/customer/details/FieldEditButton';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { ServiceProvider } from '@/marketplace/types';
import { waitForConfirmation } from '@/modal/actions';
import { showErrorResponse, showSuccess } from '@/store/notify';
import { ActionButton } from '@/table/ActionButton';
import { renderFieldOrDash } from '@/table/utils';
import { getCustomer, isStaff } from '@/workspace/selectors';

import { SecretValueField } from '../SecretValueField';

interface OwnProps {
  serviceProvider: ServiceProvider;
  setServiceProvider(data: ServiceProvider): void;
}

export const ServiceProviderManagement: FC<OwnProps> = ({
  serviceProvider,
  setServiceProvider,
}) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
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
      dispatch(
        showErrorResponse(
          error as any,
          translate('Unable to retrieve service provider API secret code.'),
        ),
      );
    }
  }, [error, dispatch]);

  const { mutate: regenerateSecretCode, isPending: isGenerating } = useMutation(
    {
      mutationFn: async () => {
        try {
          await waitForConfirmation(
            dispatch,
            translate('Regenerate secret API code'),
            translate(
              'After secret API code has been regenerated, it will not be possible to submit usage with the old key.',
            ),
            {
              type: 'warning',
              positiveButton: translate('Regenerate'),
              negativeButton: translate('Cancel'),
            },
          );
        } catch {
          return;
        }

        try {
          const data = await serviceProviderApiSecretCodeGenerate({
            path: { uuid: serviceProvider.uuid },
          }).then((r) => r.data);
          queryClient.setQueryData(
            ['ServiceProviderSecretCode', serviceProvider?.uuid],
            data,
          );
          dispatch(
            showSuccess(
              translate('Service provider API secret code has been generated.'),
            ),
          );
        } catch (error) {
          dispatch(
            showErrorResponse(
              error,
              translate('Unable to generate service provider API secret code.'),
            ),
          );
        }
      },
    },
  );

  const update = async (formData) => {
    try {
      const res = await marketplaceServiceProvidersPartialUpdate({
        path: { uuid: serviceProvider.uuid },
        body: formData,
      });
      setServiceProvider(res.data);
      return res;
    } catch (error) {
      const errorMessage =
        error?.response?.message || translate('Something went wrong');
      const errorData = error?.response?.data;
      throw new SubmissionError({
        _error: errorMessage,
        ...errorData,
      });
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
            <ActionButton
              title={translate('Regenerate')}
              action={regenerateSecretCode}
              pending={isGenerating}
              className="btn btn-primary"
            />
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
