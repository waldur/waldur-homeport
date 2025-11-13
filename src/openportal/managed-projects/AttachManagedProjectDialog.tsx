import { useMemo, useCallback } from 'react';
import { Form, Field } from 'react-final-form';
import { useSelector } from 'react-redux';
import {
  ManagedProject,
  openportalManagedProjectsAttach,
} from 'waldur-js-client';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { useNotify } from '@waldur/store/hooks';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

import { ProjectAutocompleteField } from './ProjectAutocompleteField';

const INITIAL_VALUES = {
  project: null,
} as const;

const validateRequired = (value: any) =>
  value ? undefined : translate('This field is required.');

// Types
interface AttachProjectFormValues {
  project: any;
}

interface AttachManagedProjectDialogProps {
  project: ManagedProject;
  resolve: {
    refetch: () => Promise<void>;
  };
}

// Main component
export const AttachManagedProjectDialog: React.FC<
  AttachManagedProjectDialogProps
> = ({ project, resolve }) => {
  if (!project) {
    return (
      <ModalDialog title={translate('Attach Project')}>
        <div className="alert alert-danger" role="alert">
          {translate('Managed Project is not available.')}
        </div>
      </ModalDialog>
    );
  }

  const { showErrorResponse, showSuccess } = useNotify();
  const { closeDialog } = useModal();
  const currentCustomer = useSelector(getCustomer);
  const user = useSelector(getUser);

  const projectTemplate = useMemo(() => {
    return project?.project_template_data;
  }, [project?.project_template_data]);

  if (!projectTemplate) {
    return (
      <ModalDialog title={translate('Attach Project')}>
        <div className="alert alert-danger" role="alert">
          {translate('Project template data is not available.')}
        </div>
      </ModalDialog>
    );
  }

  const targetCustomer = useMemo(() => {
    return projectTemplate?.customer_data;
  }, [projectTemplate?.customer_data]);

  if (!targetCustomer) {
    return (
      <ModalDialog title={translate('Attach Project')}>
        <div className="alert alert-danger" role="alert">
          {translate(
            'Customer Organization into which to create the project is not available.',
          )}
        </div>
      </ModalDialog>
    );
  }

  const canEditCustomer = useMemo(
    () =>
      hasPermission(user, {
        permission: PermissionEnum.UPDATE_CUSTOMER,
        customerId: currentCustomer?.uuid,
      }),
    [user, currentCustomer?.uuid],
  );

  const canEditTargetCustomer = useMemo(
    () =>
      hasPermission(user, {
        permission: PermissionEnum.UPDATE_CUSTOMER,
        customerId: targetCustomer?.uuid,
      }),
    [user, targetCustomer?.uuid],
  );

  const handleSubmit = useCallback(
    async (formValues: AttachProjectFormValues) => {
      try {
        await openportalManagedProjectsAttach({
          path: {
            identifier: project.identifier,
            destination: project.destination,
          },
          body: { project_uuid: formValues.project.uuid },
        });
        showSuccess(translate('Project has been attached.'));
        closeDialog();
        await resolve.refetch();
      } catch (error) {
        showErrorResponse(error, translate('Unable to attach the project.'));
      }
    },
    [currentCustomer, showSuccess, showErrorResponse, closeDialog, resolve],
  );

  // Permission check
  if (!canEditCustomer) {
    return (
      <ModalDialog title={translate('Attach Project')}>
        <div className="alert alert-danger" role="alert">
          {translate(
            'You do not have permission to edit ManagedProjects in {customer}.',
            { customer: currentCustomer?.name },
          )}
        </div>
      </ModalDialog>
    );
  }

  if (!canEditTargetCustomer) {
    return (
      <ModalDialog title={translate('Attach Project')}>
        <div className="alert alert-danger" role="alert">
          {translate(
            'You do not have permission to attach projects from {customer}.',
            { customer: targetCustomer?.name },
          )}
        </div>
      </ModalDialog>
    );
  }

  const query = useMemo(
    () => ({
      customer: targetCustomer?.uuid,
      field: ['name', 'uuid'],
      o: 'name',
    }),
    [targetCustomer?.uuid],
  );

  return (
    <Form
      onSubmit={handleSubmit}
      initialValues={INITIAL_VALUES}
      subscription={{ submitting: true, invalid: true, pristine: true }}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit} noValidate>
          <ModalDialog
            title={translate('Attach Project')}
            footer={
              <div className="mb-5 text-end">
                <SubmitButton
                  submitting={submitting}
                  invalid={invalid}
                  label={translate('Attach')}
                />
              </div>
            }
          >
            <FormGroup
              controlId="project"
              label={translate(
                'Choose a project to attach. Note that only unmanaged projects in {customer} can be attached.',
                { customer: targetCustomer?.name },
              )}
              required
            >
              <Field
                name="project"
                component={ProjectAutocompleteField as any}
                placeholder={translate('Select project')}
                validate={validateRequired}
                query={query}
                required
                reactSelectProps={{
                  isClearable: true,
                  closeMenuOnSelect: true,
                }}
                noOptionsMessage={() => translate('No projects found')}
              />
            </FormGroup>
          </ModalDialog>
        </form>
      )}
    />
  );
};
