import { useQuery } from '@tanstack/react-query';
import arrayMutators from 'final-form-arrays';
import { FC, useEffect, useState } from 'react';
import { Alert, Col, Row } from 'react-bootstrap';
import { Field, Form, FormRenderProps } from 'react-final-form';
import {
  marketplaceRemoteSynchronisationsCreate,
  marketplaceRemoteSynchronisationsUpdate,
  RemoteSynchronisation,
  RemoteSynchronisationRequest,
  remoteWaldurApiRemoteCategories,
  remoteWaldurApiRemoteCustomers,
} from 'waldur-js-client';

import { required } from '@waldur/core/validators';
import {
  FieldError,
  SecretField,
  SelectField,
  StringField,
  SubmitButton,
} from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { AsyncPaginate } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { providerAutocomplete } from '@waldur/marketplace/common/autocompletes';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { Category, ServiceProvider } from '@waldur/marketplace/types';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';

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
  const { showSuccess, showErrorResponse } = useNotify();
  const { closeDialog } = useModal();

  const isEdit = Boolean(remoteSync?.uuid);

  const onSubmit = async (values: FormData) => {
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
    try {
      if (isEdit) {
        await marketplaceRemoteSynchronisationsUpdate({
          path: { uuid: remoteSync.uuid },
          body: payload,
        });
      } else {
        await marketplaceRemoteSynchronisationsCreate({ body: payload });
      }
      if (refetch) await refetch();
      showSuccess(
        isEdit
          ? translate('Remote synchronization has been updated.')
          : translate('Remote synchronization added successfully'),
      );
      closeDialog();
    } catch (e) {
      showErrorResponse(
        e,
        isEdit
          ? translate('Unable to update remote synchronization.')
          : translate('Unable to create remote synchronization.'),
      );
    }
  };

  return (
    <Form<FormData>
      onSubmit={onSubmit}
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
              remotelocalcategory_set: remoteSync.remotelocalcategory_set.map(
                (item) => ({
                  local_category: {
                    url: item.local_category,
                    title: item.local_category_name,
                  } as Category,
                  remote_category: {
                    uuid: item.remote_category,
                    title: item.remote_category_name,
                  } as Category,
                }),
              ),
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
  const [checkedCredentials, setCheckedCredentials] = useState({
    api_url: '',
    token: '',
  });

  const {
    data: remoteCustomers,
    refetch: remoteCustomersRefetch,
    isFetching: remoteCustomersFetching,
    error: remoteCustomersError,
  } = useQuery({
    queryKey: ['remoteCustomers', remoteSync?.uuid],

    queryFn: async () =>
      values.api_url && values.token
        ? await remoteWaldurApiRemoteCustomers({
            body: { api_url: values.api_url, token: values.token },
          }).then((response) => response.data)
        : [],

    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
    enabled: false,
  });

  const {
    data: remoteCategories,
    refetch: remoteCategoriesRefetch,
    isFetching: remoteCategoriesFetching,
    error: remoteCategoriesError,
  } = useQuery({
    queryKey: ['remoteCategories', remoteSync?.uuid],

    queryFn: async () =>
      values.api_url && values.token
        ? await remoteWaldurApiRemoteCategories({
            body: { api_url: values.api_url, token: values.token },
          }).then((response) => response.data)
        : [],

    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
    enabled: false,
  });

  const loadData = () => {
    if (
      checkedCredentials.api_url === values?.api_url &&
      checkedCredentials.token === values?.token
    )
      return;
    remoteCustomersRefetch();
    remoteCategoriesRefetch();
    setCheckedCredentials({ api_url: values?.api_url, token: values?.token });
  };

  useEffect(() => {
    loadData();
  }, []);

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
        <FormGroup label={translate('Remote API URL')} required>
          <Field
            component={StringField as any}
            name="api_url"
            placeholder={translate('e.g.') + ' waldur.example.com'}
            validate={required}
            onBlur={loadData}
          />
        </FormGroup>
        <FormGroup label={translate('Authentication token')} required>
          <Field
            component={SecretField as any}
            name="token"
            placeholder={translate('e.g.') + ' SECRET_TOKEN'}
            validate={required}
            onBlur={loadData}
          />
        </FormGroup>
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
            <FormGroup label={translate('Remote organization')} required>
              <Field
                component={SelectField}
                name="remote_organization"
                options={remoteCustomers}
                isLoading={remoteCustomersFetching}
                getOptionValue={(option) => option.uuid}
                getOptionLabel={(option) => option.name}
                validate={required}
              />
            </FormGroup>
          </Col>
          <Col xs={6}>
            <FormGroup label={translate('Local service provider')} required>
              <Field name="local_service_provider" validate={required}>
                {(fieldProps) => (
                  <AsyncPaginate
                    loadOptions={providerAutocomplete}
                    defaultOptions
                    getOptionValue={(option) => option.url}
                    getOptionLabel={(option) => option.customer_name}
                    value={fieldProps.input.value}
                    onChange={(value) => fieldProps.input.onChange(value)}
                    noOptionsMessage={() => translate('No providers')}
                    className="metronic-select-container"
                    classNamePrefix="metronic-select"
                  />
                )}
              </Field>
            </FormGroup>
          </Col>
        </Row>
        <FormGroup label={translate('Category mapping rules')} required>
          <CategoryMappingRulesField remoteCategories={remoteCategories} />
        </FormGroup>
        <Field
          component={AwesomeCheckboxField as any}
          name="is_active"
          label={translate('Enable synchronization')}
          className="text-gray-700"
        />
      </ModalDialog>
    </form>
  );
};
