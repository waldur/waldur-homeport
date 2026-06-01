import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  marketplaceOfferingGroupsCreate,
  marketplaceOfferingGroupsPartialUpdate,
  OfferingGroup,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { SubmitButton, StringGroup, TextGroup } from '@/form';
import { translate } from '@/i18n';
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
}

export const OfferingGroupFormDialog: FC<OfferingGroupFormDialogProps> = (
  props,
) => {
  const isEdit = Boolean(props.resolve.group?.uuid);

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
              customer: props.resolve.customerUrl,
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
