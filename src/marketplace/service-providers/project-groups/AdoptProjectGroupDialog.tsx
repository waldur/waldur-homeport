import { useQuery } from '@tanstack/react-query';
import { FC, useEffect, useMemo, useState } from 'react';
import { Form as BootstrapForm } from 'react-bootstrap';
import { Field, Form, useForm, useFormState } from 'react-final-form';
import {
  marketplaceServiceProviderProjectGroupsAdoptableProjectsList,
  marketplaceServiceProviderProjectGroupsCreate,
  marketplaceServiceProviderProjectGroupsList,
  Project,
  projectsList,
  ServiceProvider,
} from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { OWN_ERROR_STATE } from '@/core/queryRetry';
import { required } from '@/core/validators';
import {
  AsyncSelectGroup,
  NumberGroup,
  StringGroup,
  SubmitButton,
} from '@/form';
import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useUser } from '@/workspace/hooks';

import { OutsideRangeField } from './OutsideRangeField';
import { useInlineErrorToast } from './useInlineErrorToast';
import {
  getValidationErrors,
  PROJECT_GROUP_QUERY_KEYS,
  toSubmissionErrors,
  validateGid,
  validateGroupName,
} from './utils';

interface AdoptProjectGroupDialogProps {
  resolve: { provider: ServiceProvider; refetch: () => void };
}

interface ProjectOption {
  uuid: string;
  name: string;
  customer_name?: string;
  /** The project's group at the provider, as the adoptable list names it. */
  group_name?: string | null;
}

interface ExistingGroup {
  name: string;
  gid: number | null;
}

interface FormValues {
  project?: ProjectOption;
  gid?: number | string;
  name?: string;
  allow_outside_range?: boolean;
  existing_group?: ExistingGroup | null;
}

const PROJECT_FIELDS: Array<keyof Project> = ['uuid', 'name', 'customer_name'];

const existingGroupMessage = (group: ExistingGroup) =>
  group.gid == null
    ? translate(
        'This project already has group {name}. Use Change GID on it instead.',
        { name: group.name },
      )
    : translate(
        'This project already has group {name} with GID {gid}. Use Change GID on it instead.',
        { name: group.name, gid: group.gid },
      );

const validateProject = (project?: ProjectOption) =>
  required(project) ||
  (project?.group_name
    ? existingGroupMessage({ name: project.group_name, gid: null })
    : undefined);

const validateNoExistingGroup = (group?: ExistingGroup | null) =>
  group ? existingGroupMessage(group) : undefined;

/**
 * Looks up the selected project's group at the provider: the full project
 * list does not name it, and the adoptable list leaves out its GID. Only the
 * selected project is looked up, never the provider's whole group list.
 */
const SelectedProjectGroup: FC<{ providerUuid: string }> = ({
  providerUuid,
}) => {
  const form = useForm<FormValues>();
  const { values } = useFormState<FormValues>({
    subscription: { values: true },
  });
  const projectUuid = values.project?.uuid;
  const { data } = useQuery({
    queryKey: ['provider-project-group', providerUuid, projectUuid],
    queryFn: async () => {
      const response = await marketplaceServiceProviderProjectGroupsList({
        query: {
          service_provider_uuid: providerUuid,
          project_uuid: projectUuid,
        },
      });
      const group = response.data[0];
      return group ? { name: group.name, gid: group.gid } : null;
    },
    enabled: Boolean(projectUuid),
    meta: OWN_ERROR_STATE,
  });
  const found = projectUuid ? (data ?? null) : null;
  useEffect(() => {
    // A form value, so the form's own validation blocks submitting.
    form.change('existing_group', found);
  }, [form, found?.name, found?.gid]);
  return (
    <Field name="existing_group" validate={validateNoExistingGroup}>
      {({ input }) =>
        input.value ? (
          <AlertItem
            variant="warning"
            className="mb-4"
            data-testid="existing-group"
            title={existingGroupMessage(input.value)}
          />
        ) : null
      }
    </Field>
  );
};

/** Record a group the directory already holds, with its GID, for a project. */
export const AdoptProjectGroupDialog: FC<AdoptProjectGroupDialogProps> = ({
  resolve: { provider, refetch },
}) => {
  const user = useUser();
  // A provider owner may adopt for projects with a resource or an order at
  // the provider, in any state. Staff may adopt for any project, but start
  // from the same list, where the projects that need a group are.
  const [anyProject, setAnyProject] = useState(false);
  const loadProjects = useMemo(
    () =>
      user.is_staff && anyProject
        ? createLoadOptions(projectsList, 'name', {
            field: PROJECT_FIELDS,
            o: ['name'],
          })
        : createLoadOptions(
            marketplaceServiceProviderProjectGroupsAdoptableProjectsList,
            'query',
            { service_provider_uuid: provider.uuid },
          ),
    [user.is_staff, anyProject, provider.uuid],
  );

  const toastUnshownError = useInlineErrorToast(
    translate('Unable to adopt the project group.'),
  );
  const mutation = useManagedMutation<any, any, FormValues>({
    mutationFn: (values) =>
      marketplaceServiceProviderProjectGroupsCreate({
        body: {
          service_provider: provider.uuid,
          project: values.project!.uuid,
          gid: Number(values.gid),
          ...(values.name ? { name: values.name } : {}),
          allow_outside_range: Boolean(values.allow_outside_range),
        },
      }),
    successMessage: translate('Project group has been adopted.'),
    onError: toastUnshownError,
    invalidateQueries: PROJECT_GROUP_QUERY_KEYS,
    refetch,
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await mutation.mutateAsync(values);
    } catch (error) {
      const data = getValidationErrors(error);
      if (data) {
        return toSubmissionErrors(data, [
          'project',
          'gid',
          'name',
          'allow_outside_range',
        ]);
      }
    }
  };

  return (
    <Form<FormValues>
      onSubmit={onSubmit}
      render={({
        handleSubmit,
        submitting,
        hasValidationErrors,
        submitError,
        dirtySinceLastSubmit,
        form,
      }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Adopt existing group')}
            footer={
              <SubmitButton
                disabled={hasValidationErrors}
                submitting={submitting}
                label={translate('Adopt')}
              />
            }
          >
            <p className="text-muted">
              {translate(
                'Record a group your directory already holds, so the project keeps its GID and Waldur never hands that GID to anything else. The project needs no resource yet.',
              )}
            </p>
            {submitError && !dirtySinceLastSubmit && (
              <AlertItem variant="error" title={submitError} className="mb-4" />
            )}
            {user.is_staff && (
              <BootstrapForm.Check
                type="switch"
                id="adopt-any-project"
                className="mb-2"
                label={translate(
                  'Show all projects, not only those using this service provider',
                )}
                checked={anyProject}
                onChange={(event) => {
                  setAnyProject(event.target.checked);
                  form.change('project', undefined);
                }}
                disabled={submitting}
              />
            )}
            <AsyncSelectGroup
              key={anyProject ? 'any' : 'adoptable'}
              name="project"
              label={translate('Project')}
              loadOptions={loadProjects}
              getOptionValue={(option: ProjectOption) => option.uuid}
              getOptionLabel={(option: ProjectOption) => {
                const label = option.customer_name
                  ? `${option.name} (${option.customer_name})`
                  : option.name;
                return option.group_name
                  ? translate('{project} — has group {name}', {
                      project: label,
                      name: option.group_name,
                    })
                  : label;
              }}
              isOptionDisabled={(option: ProjectOption) =>
                Boolean(option.group_name)
              }
              required
              validate={validateProject}
              disabled={submitting}
            />
            <SelectedProjectGroup providerUuid={provider.uuid} />
            <NumberGroup
              name="gid"
              label={translate('GID')}
              description={translate('The GID the group has in the directory.')}
              required
              validate={validateGid}
              disabled={submitting}
            />
            <StringGroup
              name="name"
              label={translate('Group name')}
              description={translate(
                'The name the group has in the directory. Leave empty to use the project’s short name.',
              )}
              required={false}
              validate={validateGroupName}
              disabled={submitting}
            />
            <OutsideRangeField disabled={submitting} />
          </ModalDialog>
        </form>
      )}
    />
  );
};
