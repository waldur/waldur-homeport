import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  marketplaceTagsCreate,
  marketplaceTagsPartialUpdate,
  Tag,
  TagRequest,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { SubmitButton } from '@/form';
import { FormContainerFinal } from '@/form/FormContainerFinal';
import { StringField } from '@/form/StringField';
import { TextField } from '@/form/TextField';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface TagFormDialogProps {
  resolve: { tag?: Tag; refetch: () => void };
}

export const TagFormDialog: FC<TagFormDialogProps> = (props) => {
  const isEdit = Boolean(props.resolve.tag?.uuid);

  const initialValues = useMemo(
    () => (props.resolve?.tag ? { ...props.resolve.tag } : undefined),
    [props.resolve?.tag],
  );

  const tagMutation = useManagedMutation<any, any, TagRequest>({
    mutationFn: (values) =>
      isEdit
        ? marketplaceTagsPartialUpdate({
            path: { uuid: props.resolve.tag.uuid },
            body: {
              name: values.name,
              description: values.description,
            },
          })
        : marketplaceTagsCreate({
            body: {
              name: values.name,
              description: values.description,
            },
          }),
    successMessage: isEdit
      ? translate('The tag has been updated.')
      : translate('The tag has been created.'),
    errorMessage: isEdit
      ? translate('Unable to update tag.')
      : translate('Unable to create tag.'),
    refetch: props.resolve.refetch,
  });

  const onSubmit = async (values) => {
    try {
      await tagMutation.mutateAsync(values);
    } catch (e) {
      if (e.response && e.response.status === 400) {
        return e.response.data;
      }
    }
  };

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit {title}', {
                    title: props.resolve.tag.name,
                  })
                : translate('Create tag')
            }
            footer={
              <SubmitButton
                disabled={invalid}
                submitting={submitting}
                label={isEdit ? translate('Edit') : translate('Create')}
              />
            }
          >
            <FormContainerFinal submitting={submitting}>
              <StringField
                label={translate('Name')}
                name="name"
                required
                validate={required}
                maxLength={150}
              />

              <TextField
                label={translate('Description')}
                name="description"
                required={false}
              />
            </FormContainerFinal>
          </ModalDialog>
        </form>
      )}
    />
  );
};
