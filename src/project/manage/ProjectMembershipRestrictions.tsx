import { BuildingsIcon, QuestionIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useCallback } from 'react';
import {
  customersRetrieve,
  Project,
  projectsPartialUpdate,
} from 'waldur-js-client';

import { STALE_TIME } from '@/core/constants';
import { lazyComponent } from '@/core/lazyComponent';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { Panel } from '@/core/Panel';
import { MembershipRestrictionFormItems } from '@/core/restrictions';
import { Tip } from '@/core/Tooltip';
import { EditFieldProvider } from '@/form/editFields';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionButton } from '@/table/ActionButton';
import { useSetProject, useUser } from '@/workspace/hooks';

interface ProjectMembershipRestrictionsProps {
  project: Project;
}

const OrganizationRestrictionsDialog = lazyComponent(() =>
  import('./restrictions/OrganizationRestrictionsDialog').then((module) => ({
    default: module.OrganizationRestrictionsDialog,
  })),
);

const getRestrictionsTooltip = () =>
  translate(
    'When restrictions are configured, only users matching at least one criterion can become members. If multiple restriction types are configured, matching any one of them is sufficient (OR logic). Project-level restrictions are applied in addition to organization-level restrictions.',
  );

export const ProjectMembershipRestrictions: FC<
  ProjectMembershipRestrictionsProps
> = ({ project }) => {
  const { openDialog } = useModal();
  const user = useUser();
  const setProject = useSetProject();

  // Fetch customer data for inherited restrictions
  const {
    data: customer,
    isLoading,
    error,
    refetch: refetchCustomer,
  } = useQuery({
    queryKey: ['customer', project.customer_uuid],
    queryFn: async () => {
      const response = await customersRetrieve({
        path: { uuid: project.customer_uuid },
      });
      return response.data;
    },
    staleTime: STALE_TIME,
  });

  const canEdit = hasPermission(user, {
    permission: PermissionEnum.CREATE_PROJECT,
    customerId: project.customer_uuid,
  });

  const { mutateAsync: updateProject } = useManagedMutation({
    mutationFn: (formData: Record<string, any>) =>
      projectsPartialUpdate({
        path: { uuid: project.uuid },
        body: formData,
      }),
    successMessage: translate('Membership restrictions updated successfully.'),
    errorMessage: translate('Failed to update membership restrictions.'),
    onSuccess: (response) => {
      setProject(response.data);
    },
    closeModal: false,
  });

  const openOrganizationRestrictionsDialog = useCallback(() => {
    if (customer) {
      openDialog(OrganizationRestrictionsDialog, {
        resolve: { customer },
      });
    }
  }, [customer]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !customer) {
    return (
      <LoadingErred
        message={translate('Failed to load organization data.')}
        loadData={refetchCustomer}
      />
    );
  }

  return (
    <Panel
      title={
        <span className="d-flex align-items-center gap-2">
          {translate('Membership restrictions')}
          <Tip
            id="project-restrictions-tooltip"
            label={getRestrictionsTooltip()}
          >
            <QuestionIcon
              size={16}
              weight="bold"
              className="text-muted cursor-pointer"
            />
          </Tip>
        </span>
      }
      cardBordered
      actions={
        <ActionButton
          action={openOrganizationRestrictionsDialog}
          title={translate('Organization restrictions')}
          iconNode={<BuildingsIcon weight="bold" />}
          variant="secondary"
        />
      }
    >
      <EditFieldProvider scope={project} callback={updateProject}>
        <FormTable hideActions={!canEdit}>
          <MembershipRestrictionFormItems />
        </FormTable>
      </EditFieldProvider>
    </Panel>
  );
};
