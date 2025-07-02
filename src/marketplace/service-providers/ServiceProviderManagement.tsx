import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SubmissionError } from 'redux-form';
import {
  marketplaceServiceProvidersPartialUpdate,
  serviceProviderApiSecretCodeGenerate,
  serviceProviderApiSecretCodeRetrieve,
} from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { FieldEditButton } from '@waldur/customer/details/FieldEditButton';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { ServiceProvider } from '@waldur/marketplace/types';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';
import { getCustomer } from '@waldur/workspace/selectors';

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
          value={serviceProvider?.description || 'N/A'}
          actions={
            <FieldEditButton
              customer={serviceProvider}
              name="description"
              callback={update}
            />
          }
        />
      </FormTable>
    );
  }
  return null;
};
