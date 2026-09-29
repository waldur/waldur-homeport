import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  marketplaceOfferingGroupsCreate,
  marketplaceOfferingGroupsPartialUpdate,
  OfferingGroup,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { AsyncSelectGroup, SubmitButton, StringGroup, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { organizationAutocomplete } from '@/marketplace/common/autocompletes';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface OfferingGroupFormDialogProps {
  resolve: {
    group?: OfferingGroup;
    customerUrl?: string;
    refetch: () => void;
  };
}

interface FormValues {
  title: string;
  description?: string;
  organization?: { url: string; name: string };
}

export const OfferingGroupFormDialog: FC<OfferingGroupFormDialogProps> = (
  props,
) => {
  const isEdit = Boolean(props.resolve.group?.uuid);
  // Without a customer, as on the admin list, the group's service provider
  // is picked in the form.
  const pickOrganization = !isEdit && !props.resolve.customerUrl;

  const loadOrganizations = useMemo(
    () =>
      organizationAutocomplete({
        field: ['name', 'url', 'uuid'],
        o: 'name',
        is_service_provider: true,
      }),
    [],
  );

  const initialValues = useMemo<FormValues | undefined>(
    () =>
      props.resolve.group
        ? {
            title: props.resolve.group.title ?? '',
            description: props.resolve.group.description ?? '',
          }
        : undefined,
    [props.resolve.group],
  );

  const mutation = useManagedMutation<any, any, FormValues>({
    mutationFn: (values) =>
      isEdit
        ? marketplaceOfferingGroupsPartialUpdate({
            path: { uuid: props.resolve.group!.uuid! },
            body: {
              title: values.title,
              description: values.description,
            },
          })
        : marketplaceOfferingGroupsCreate({
            body: {
              title: values.title,
              description: values.description,
              customer: props.resolve.customerUrl ?? values.organization?.url,
            },
          }),
    successMessage: isEdit
      ? translate('Offering group has been updated.')
      : translate('Offering group has been created.'),
    errorMessage: isEdit
      ? translate('Unable to update offering group.')
      : translate('Unable to create offering group.'),
    refetch: props.resolve.refetch,
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await mutation.mutateAsync(values);
    } catch (e: any) {
      if (e?.response?.status === 400) {
        return e.response.data;
      }
    }
  };

  return (
    <Form<FormValues>
      onSubmit={onSubmit}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit {title}', {
                    title: props.resolve.group!.title,
                  })
                : translate('Create offering group')
            }
            footer={
              <SubmitButton
                disabled={invalid}
                submitting={submitting}
                label={isEdit ? translate('Save') : translate('Create')}
              />
            }
          >
            <div className="size-sm">
              {pickOrganization && (
                <AsyncSelectGroup
                  name="organization"
                  label={translate('Service provider')}
                  validate={required}
                  required
                  placeholder={translate('Select service provider...')}
                  loadOptions={loadOrganizations}
                  getOptionLabel={(option) => option.name}
                  getOptionValue={(option) => option.url}
                  noOptionsMessage={() => translate('No service providers')}
                  isClearable={true}
                  disabled={submitting}
                />
              )}
              <StringGroup
                label={translate('Title')}
                name="title"
                required
                validate={required}
                maxLength={255}
                disabled={submitting}
              />

              <TextGroup
                label={translate('Description')}
                name="description"
                required={false}
                disabled={submitting}
              />
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
