import { FC, useMemo } from 'react';
import { Field, Form } from 'react-final-form';
import {
  // CreateChecklistRequest,
  checklistsAdminCreate,
  checklistsAdminPartialUpdate,
  PatchedChecklistRequest,
  ChecklistRequest,
  // PatchedCreateChecklistRequest,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { SelectField, StringField, SubmitButton, TextField } from '@/form';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { isExperimentalUiComponentsVisible } from '@/marketplace/utils';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { checklistTypeOptions } from '../utils';

interface ChecklistFormDialogProps {
  resolve: {
    checklistUuid?: string;
    refetch: () => void;
  };
  initialValues?: PatchedChecklistRequest;
}

export const ChecklistFormDialog: FC<ChecklistFormDialogProps> = ({
  resolve: { checklistUuid, refetch },
  initialValues,
}) => {
  const isEdit = Boolean(checklistUuid);

  const onSubmitMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) => {
      const body: ChecklistRequest = {
        name: formData.name,
        description: formData.description,
        checklist_type: formData.checklist_type,
      };
      if (isEdit) {
        return checklistsAdminPartialUpdate({
          path: { uuid: checklistUuid },
          body,
        }).then((response) => response.data);
      } else {
        return checklistsAdminCreate({ body }).then(
          (response) => response.data,
        );
      }
    },
    successMessage: isEdit
      ? translate('Checklist has been updated.')
      : translate('Checklist has been added.'),
    errorMessage: isEdit
      ? translate('Unable to update checklist.')
      : translate('Unable to add checklist.'),
    refetch,
  });

  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();
  const allowedChecklistTypeOptions = useMemo(
    () =>
      showExperimentalUiComponents
        ? checklistTypeOptions
        : checklistTypeOptions.filter(
            (opt) => opt.value === 'project_metadata',
          ),
    [],
  );

  return (
    <Form
      onSubmit={(values) => onSubmitMutation.mutateAsync(values)}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, pristine, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit checklist')
                : translate('Create new checklist')
            }
            footer={
              <>
                <CloseDialogButton className="min-w-125px" />
                <SubmitButton
                  disabled={invalid || pristine}
                  submitting={submitting}
                  label={
                    isEdit ? translate('Save changes') : translate('Confirm')
                  }
                  className="btn btn-primary min-w-125px"
                />
              </>
            }
          >
            <FormGroup label={translate('Checklist name')} required space={5}>
              <Field
                name="name"
                validate={required}
                component={StringField}
                placeholder={translate('e.g. GDPR Compliance')}
              />
            </FormGroup>

            <FormGroup label={translate('Checklist type')} required space={5}>
              <Field
                name="checklist_type"
                component={SelectField}
                options={allowedChecklistTypeOptions}
                validate={required}
                simpleValue
              />
            </FormGroup>

            <FormGroup label={translate('Description')} space={5}>
              <Field
                name="description"
                component={TextField}
                placeholder={translate(
                  'Brief description of this checklist...',
                )}
              />
            </FormGroup>
          </ModalDialog>
        </form>
      )}
    />
  );
};
