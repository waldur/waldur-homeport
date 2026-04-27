import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';
import { projectsPartialUpdate, Project } from 'waldur-js-client';

import {
  fieldConfig,
  getRestrictionsArray,
  RestrictionField,
} from '@/core/restrictions';
import { SubmitButton } from '@/form';
import { CommaSeparatedListField } from '@/form/CommaSeparatedListField';
import { FormContainer } from '@/form/FormContainer';
import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@/store/notify';
import { setCurrentProject } from '@/workspace/actions';

const FORM_ID = 'EditProjectMembershipRestrictionsDialog';

interface FormData {
  value: string[] | string;
}

interface EditProjectMembershipRestrictionsDialogProps {
  resolve: {
    project: Project;
    field: RestrictionField;
  };
}

export const EditProjectMembershipRestrictionsDialog = reduxForm<
  FormData,
  EditProjectMembershipRestrictionsDialogProps
>({
  form: FORM_ID,
})(({ resolve, handleSubmit, submitting, invalid, dirty }) => {
  const dispatch = useDispatch();
  const { field } = resolve;
  const config = fieldConfig[field];

  const processRequest = useCallback(
    async (values: FormData) => {
      try {
        // Ensure value is always an array (defensive check)
        let arrayValue: string[];
        if (Array.isArray(values.value)) {
          arrayValue = values.value.filter(Boolean);
        } else if (typeof values.value === 'string') {
          arrayValue = (values.value as string)
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean);
        } else {
          arrayValue = [];
        }

        const response = await projectsPartialUpdate({
          path: { uuid: resolve.project.uuid },
          body: {
            [field]: arrayValue,
          },
        });
        dispatch(
          showSuccess(
            translate('Membership restrictions updated successfully.'),
          ),
        );
        if (response.data) {
          dispatch(setCurrentProject(response.data as unknown as Project));
        }
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(
          showErrorResponse(
            e,
            translate('Failed to update membership restrictions.'),
          ),
        );
      }
    },
    [resolve.project.uuid, field, dispatch],
  );

  return (
    <form onSubmit={handleSubmit(processRequest)}>
      <ModalDialog
        title={config.title}
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary flex-equal"
              onClick={() => dispatch(closeModalDialog())}
            >
              {translate('Cancel')}
            </button>
            <SubmitButton
              disabled={invalid || !dirty}
              submitting={submitting}
              label={translate('Save')}
              className="btn btn-primary flex-equal"
            />
          </>
        }
      >
        <FormContainer submitting={submitting}>
          <CommaSeparatedListField
            name="value"
            label={config.label}
            placeholder={config.placeholder}
            description={config.description}
          />
        </FormContainer>
      </ModalDialog>
    </form>
  );
});

export const getInitialValues = (
  project: Project,
  field: RestrictionField,
): FormData => ({
  value: getRestrictionsArray(project[field]),
});
