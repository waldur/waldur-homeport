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
import { useModal } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
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
})(({ resolve, handleSubmit, invalid, dirty }) => {
  const dispatch = useDispatch();

  const { closeDialog } = useModal();

  const { field } = resolve;
  const config = fieldConfig[field];

  const { mutate, isPending } = useManagedMutation<Project, any, FormData>({
    mutationFn: (values) => {
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

      return projectsPartialUpdate({
        path: { uuid: resolve.project.uuid },
        body: {
          [field]: arrayValue,
        },
      }).then((response) => response.data);
    },
    successMessage: translate('Membership restrictions updated successfully.'),
    errorMessage: translate('Failed to update membership restrictions.'),
    onSuccess: (project) => {
      dispatch(setCurrentProject(project));
    },
  });

  return (
    <form onSubmit={handleSubmit((values) => mutate(values))}>
      <ModalDialog
        title={config.title}
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary flex-equal"
              onClick={() => closeDialog()}
            >
              {translate('Cancel')}
            </button>
            <SubmitButton
              disabled={invalid || !dirty}
              submitting={isPending}
              label={translate('Save')}
              className="btn btn-primary flex-equal"
            />
          </>
        }
      >
        <FormContainer submitting={isPending}>
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
