import { useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  ManagedProject,
  openportalManagedProjectsAttach,
  openportalUnmanagedProjectsList,
  OpenportalUnmanagedProjectsListData,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { AsyncSelectGroup, SubmitButton } from '@/form';
import { createLoadOptions } from '@/form/select';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useUser, useCustomer } from '@/workspace/hooks';

const INITIAL_VALUES = {
  project: null,
} as const;

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

  const currentCustomer = useCustomer();
  const user = useUser();

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

  const attachMutation = useManagedMutation<any, any, AttachProjectFormValues>({
    mutationFn: (formValues) =>
      openportalManagedProjectsAttach({
        path: {
          identifier: project.identifier,
          destination: project.destination,
        },
        body: { project_uuid: formValues.project.uuid },
      }),
    successMessage: translate('Project has been attached.'),
    errorMessage: translate('Unable to attach the project.'),
    refetch: resolve.refetch,
  });

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

  const query = useMemo<OpenportalUnmanagedProjectsListData['query']>(
    () => ({
      customer: [targetCustomer?.uuid],
      field: ['name', 'uuid'],
      o: ['name'],
    }),
    [targetCustomer?.uuid],
  );

  const loadOptions = useMemo(
    () => createLoadOptions(openportalUnmanagedProjectsList, 'query', query),
    [query],
  );

  return (
    <Form<AttachProjectFormValues>
      onSubmit={(values) => attachMutation.mutateAsync(values)}
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
            <AsyncSelectGroup
              label={translate(
                'Choose a project to attach. Note that only unmanaged projects in {customer} can be attached.',
                { customer: targetCustomer?.name },
              )}
              name="project"
              placeholder={translate('Select project')}
              validate={required}
              loadOptions={loadOptions}
              defaultOptions
              getOptionValue={(option) => option.uuid}
              getOptionLabel={(option) => option.name}
              isClearable={true}
              required
              noOptionsMessage={() => translate('No projects found')}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
