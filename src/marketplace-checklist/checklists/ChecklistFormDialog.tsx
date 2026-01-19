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

import { required } from '@waldur/core/validators';
import {
  SelectField,
  StringField,
  SubmitButton,
  TextField,
} from '@waldur/form';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';

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
  const { closeDialog } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();
  const isEdit = Boolean(checklistUuid);

  const onSubmit = async (formData) => {
    try {
      const body: ChecklistRequest = {
        name: formData.name,
        description: formData.description,
        checklist_type: formData.checklist_type,
      };
      if (isEdit) {
        await checklistsAdminPartialUpdate({
          path: { uuid: checklistUuid },
          body,
        }).then((response) => response.data);
      } else {
        await checklistsAdminCreate({ body }).then((response) => response.data);
      }

      refetch();
      showSuccess(
        isEdit
          ? translate('Checklist has been updated.')
          : translate('Checklist has been added.'),
      );
      closeDialog();
    } catch (e) {
      showErrorResponse(
        e,
        isEdit
          ? translate('Unable to update checklist.')
          : translate('Unable to add checklist.'),
      );
    }
  };

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
      onSubmit={onSubmit}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, pristine, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit checklist')
                : translate('Create new checklist')
            }
            closeButton
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
                component={StringField as any}
                placeholder={translate('e.g. GDPR Compliance')}
              />
            </FormGroup>

            <FormGroup label={translate('Checklist type')} required space={5}>
              <Field
                name="checklist_type"
                component={SelectField as any}
                options={allowedChecklistTypeOptions}
                validate={required}
                simpleValue
              />
            </FormGroup>

            <FormGroup label={translate('Description')} space={5}>
              <Field
                name="description"
                component={TextField as any}
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
