import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  CategoryGroupRequest,
  marketplaceCategoryGroupsCreate,
  marketplaceCategoryGroupsPartialUpdate,
} from 'waldur-js-client';

import { fileSerializer, formDataOptions } from '@/core/api';
import { required } from '@/core/validators';
import { SubmitButton, StringGroup, TextGroup, ImageGroup } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface CategoryGroupDialogProps {
  resolve: {
    categoryGroup?: any;
    refetch;
  };
}

export const CategoryGroupDialog: FC<CategoryGroupDialogProps> = ({
  resolve,
}) => {
  const isEdit = Boolean(resolve.categoryGroup?.uuid);

  const { mutateAsync } = useManagedMutation<any, any, CategoryGroupRequest>({
    mutationFn: (values) =>
      isEdit
        ? marketplaceCategoryGroupsPartialUpdate({
            path: { uuid: resolve.categoryGroup.uuid },
            body: {
              title: values.title,
              description: values.description,
              icon: fileSerializer(values.icon),
            },
            ...formDataOptions,
          })
        : marketplaceCategoryGroupsCreate({
            body: {
              title: values.title,
              description: values.description,
              icon: fileSerializer(values.icon),
            },
            ...formDataOptions,
          }),
    successMessage: isEdit
      ? translate('The category group has been updated.')
      : translate('The category group has been created.'),
    errorMessage: isEdit
      ? translate('Unable to update category group.')
      : translate('Unable to create category group.'),
    refetch: resolve.refetch,
  });

  const initialValues = useMemo(
    () => (resolve.categoryGroup ? { ...resolve.categoryGroup } : undefined),
    [resolve.categoryGroup],
  );

  return (
    <Form<CategoryGroupRequest>
      onSubmit={(values) => mutateAsync(values).catch(() => {})}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid, initialValues }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit {title}', {
                    title: resolve.categoryGroup.title,
                  })
                : translate('Create category group')
            }
            footer={
              <SubmitButton
                disabled={invalid}
                submitting={submitting}
                label={isEdit ? translate('Edit') : translate('Create')}
              />
            }
          >
            <div className="size-sm">
              <ImageGroup
                label={translate('Icon')}
                name="icon"
                initialValue={initialValues?.icon as any as string}
              />

              <StringGroup
                label={translate('Title')}
                name="title"
                required
                validate={required}
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
