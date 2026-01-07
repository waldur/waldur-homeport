import { useQueryClient } from '@tanstack/react-query';
import { FC } from 'react';
import { Field, Form } from 'react-final-form';
import {
  ChecklistCategoryRequest,
  checklistsAdminCategoriesCreate,
  checklistsAdminCategoriesUpdate,
} from 'waldur-js-client';

import { required } from '@waldur/core/validators';
import { StringField, SubmitButton, TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';

interface CategoryFormDialogProps {
  resolve: {
    categoryUuid?: string;
    refetch: () => void;
  };
  initialValues?: any; // FIX THIS: Define a proper type - not available in the sdk atm
}

export const CategoryFormDialog: FC<CategoryFormDialogProps> = ({
  resolve: { categoryUuid, refetch },
  initialValues,
}) => {
  const { closeDialog } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();
  const isEdit = Boolean(categoryUuid);

  const queryClient = useQueryClient();

  const onSubmit = async (formData: ChecklistCategoryRequest) => {
    try {
      if (isEdit) {
        await checklistsAdminCategoriesUpdate({
          path: { uuid: categoryUuid },
          body: {
            name: formData.name,
            description: formData.description,
          },
        }).then((response) => response.data);
      } else {
        await checklistsAdminCategoriesCreate({
          body: {
            name: formData.name,
            description: formData.description,
          },
        }).then((response) => response.data);
      }

      // Invalidate query cache of categories request
      queryClient.invalidateQueries({ queryKey: ['ChecklistCategories'] });

      refetch();
      showSuccess(
        isEdit
          ? translate('Checklist category has been updated.')
          : translate('Checklist category has been added.'),
      );
      closeDialog();
    } catch (e) {
      showErrorResponse(
        e,
        isEdit
          ? translate('Unable to update checklist category.')
          : translate('Unable to add checklist category.'),
      );
    }
  };

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, pristine, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit ? translate('Edit category') : translate('Add category')
            }
            closeButton
            footer={
              <>
                <CloseDialogButton className="flex-equal" />
                <SubmitButton
                  disabled={invalid || pristine}
                  submitting={submitting}
                  label={translate('Confirm')}
                  className="btn btn-primary flex-equal"
                />
              </>
            }
          >
            <FormGroup label={translate('Category name')} required space={5}>
              <Field
                name="name"
                validate={required}
                component={StringField as any}
                placeholder={translate('e.g. GDPR Compliance')}
              />
            </FormGroup>

            <FormGroup label={translate('Description')} space={5}>
              <Field
                name="description"
                component={TextField as any}
                placeholder={translate('Brief description of this category...')}
              />
            </FormGroup>
          </ModalDialog>
        </form>
      )}
    />
  );
};
