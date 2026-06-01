import { useQuery } from '@tanstack/react-query';
import arrayMutators from 'final-form-arrays';
import { FC } from 'react';
import { Alert, Col, Row } from 'react-bootstrap';
import { Form, FormRenderProps } from 'react-final-form';
import {
  marketplaceRemoteSynchronisationsCreate,
  marketplaceRemoteSynchronisationsUpdate,
  RemoteSynchronisation,
  RemoteSynchronisationRequest,
  remoteWaldurApiRemoteCategories,
  remoteWaldurApiRemoteCustomers,
} from 'waldur-js-client';

import { SHORT_STALE_TIME } from '@/core/constants';
import { required } from '@/core/validators';
import {
  AsyncSelectGroup,
  BooleanGroup,
  FieldError,
  SecretGroup,
  SelectGroup,
  StringGroup,
  SubmitButton,
} from '@/form';
import { translate } from '@/i18n';
import { providerAutocomplete } from '@/marketplace/common/autocompletes';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { Category, ServiceProvider } from '@/marketplace/types';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { CategoryMappingRulesField } from './CategoryMappingRulesField';

interface RemoteSyncFormDialogProps {
  remoteSync?: RemoteSynchronisation;
  refetch: () => void;
}

interface FormData {
  api_url: string;
  token: string;
  remote_organization: { uuid; name };
  local_service_provider: ServiceProvider;
  remotelocalcategory_set: Array<{
    remote_category: Category;
    local_category: Category;
  }>;
  is_active: boolean;
}

export const RemoteSyncFormDialog: FC<RemoteSyncFormDialogProps> = ({
  remoteSync,
  refetch,
}) => {
  const isEdit = Boolean(remoteSync?.uuid);

  const saveRemoteSyncMutation = useManagedMutation<any, any, FormData>({
    mutationFn: (values) => {
      const payload: RemoteSynchronisationRequest = {
        api_url: values.api_url,
        token: values.token,
        is_active: values.is_active,
        remote_organization_uuid: values.remote_organization.uuid,
        remote_organization_name: values.remote_organization.name,
        local_service_provider: values.local_service_provider.url,
        remotelocalcategory_set: values.remotelocalcategory_set.map((item) => ({
          local_category: item.local_category.url,
          remote_category: item.remote_category.uuid,
          remote_category_name: item.remote_category.title,
        })),
      };
      if (isEdit) {
        return marketplaceRemoteSynchronisationsUpdate({
          path: { uuid: remoteSync.uuid },
          body: payload,
        });
      } else {
        return marketplaceRemoteSynchronisationsCreate({ body: payload });
      }
    },
    successMessage: isEdit
      ? translate('Remote synchronization has been updated.')
      : translate('Remote synchronization added successfully'),
    errorMessage: isEdit
      ? translate('Unable to update remote synchronization.')
      : translate('Unable to create remote synchronization.'),
    refetch,
  });

  return (
    <Form<FormData>
      onSubmit={(values) => saveRemoteSyncMutation.mutateAsync(values)}
      initialValues={
        isEdit
          ? {
              api_url: remoteSync.api_url,
              token: remoteSync.token,
              is_active: remoteSync.is_active,
              local_service_provider: {
                url: remoteSync.local_service_provider,
                customer_name: remoteSync.local_service_provider_name,
              } as ServiceProvider,
              remote_organization: {
                name: remoteSync.remote_organization_name,
                uuid: remoteSync.remote_organization_uuid,
              },
              remotelocalcategory_set:
                remoteSync.remotelocalcategory_set?.map((item) => ({
                  local_category: {
                    url: item.local_category,
                    title: item.local_category_name,
                  } as Category,
                  remote_category: {
                    uuid: item.remote_category,
                    title: item.remote_category_name,
                  } as Category,
                })) || [],
            }
          : { remotelocalcategory_set: [{} as any] }
      }
      mutators={{ ...arrayMutators }}
      render={(formProps) => (
        <RemoteSyncRenderer {...formProps} remoteSync={remoteSync} />
      )}
    />
  );
};

const RemoteSyncRenderer = ({
  handleSubmit,
  submitting,
  pristine,
  invalid,
  values,
  remoteSync,
}: FormRenderProps<FormData, Partial<FormData>> & {
  remoteSync: RemoteSynchronisation;
}) => {
  const {
    data: remoteCustomers,
    isFetching: remoteCustomersFetching,
    error: remoteCustomersError,
  } = useQuery({
    queryKey: [
      'remoteCustomers',
      remoteSync?.uuid,
      values.api_url,
      values.token,
    ],

    queryFn: async () =>
      values.api_url && values.token
        ? await remoteWaldurApiRemoteCustomers({
            body: { api_url: values.api_url, token: values.token },
          }).then((response) => response.data)
        : [],

    staleTime: SHORT_STALE_TIME,
    refetchOnWindowFocus: false,
    retry: false,
    enabled: Boolean(values.api_url && values.token),
  });

  const {
    data: remoteCategories,
    isFetching: remoteCategoriesFetching,
    error: remoteCategoriesError,
  } = useQuery({
    queryKey: [
      'remoteCategories',
      remoteSync?.uuid,
      values.api_url,
      values.token,
    ],

    queryFn: async () =>
      values.api_url && values.token
        ? await remoteWaldurApiRemoteCategories({
            body: { api_url: values.api_url, token: values.token },
          }).then((response) => response.data)
        : [],

    staleTime: SHORT_STALE_TIME,
    refetchOnWindowFocus: false,
    retry: false,
    enabled: Boolean(values.api_url && values.token),
  });

  const isEdit = Boolean(remoteSync?.uuid);

  const connecting = remoteCustomersFetching || remoteCategoriesFetching;

  const error =
    (remoteCustomersError as any)?.response?.data ||
    (remoteCategoriesError as any)?.response?.data;

  return (
    <form onSubmit={handleSubmit}>
      <ModalDialog
        title={
          isEdit
            ? translate('Edit remote synchronization')
            : translate('Add remote synchronization')
        }
        subtitle={translate(
          'Sync remote offerings with your local provider efficiently',
        )}
        footer={
          <>
            <CloseDialogButton className="w-175px" />
            <SubmitButton
              disabled={Boolean(invalid || pristine || connecting || error)}
              submitting={submitting}
              label={isEdit ? translate('Save') : translate('Create')}
              className="btn btn-primary w-175px"
            />
          </>
        }
      >
        <StringGroup
          name="api_url"
          placeholder={translate('e.g. waldur.example.com')}
          validate={required}
          label={translate('Remote API URL')}
          required
        />
        <SecretGroup
          name="token"
          placeholder={translate('e.g. SECRET_TOKEN')}
          validate={required}
          label={translate('Authentication token')}
          required
        />
        {connecting ? (
          <Alert variant="warning" className="overflow-auto mh-200px">
            {translate('Connecting')}...
          </Alert>
        ) : error ? (
          <Alert variant="danger" className="overflow-auto mh-200px">
            <FieldError error={error} />
          </Alert>
        ) : null}
        <Row>
          <Col xs={6}>
            <SelectGroup
              name="remote_organization"
              options={remoteCustomers}
              isLoading={remoteCustomersFetching}
              getOptionValue={(option) => option.uuid}
              getOptionLabel={(option) => option.name}
              validate={required}
              label={translate('Remote organization')}
              required
            />
          </Col>
          <Col xs={6}>
            <AsyncSelectGroup
              name="local_service_provider"
              label={translate('Local service provider')}
              required
              validate={required}
              loadOptions={providerAutocomplete}
              defaultOptions
              getOptionValue={(option) => option.url}
              getOptionLabel={(option) => option.customer_name}
              noOptionsMessage={() => translate('No providers')}
            />
          </Col>
        </Row>
        <FormGroup label={translate('Category mapping rules')} required>
          <CategoryMappingRulesField remoteCategories={remoteCategories} />
        </FormGroup>
        <BooleanGroup
          name="is_active"
          label={translate('Enable synchronization')}
          className="text-gray-700"
        />
      </ModalDialog>
    </form>
  );
};
