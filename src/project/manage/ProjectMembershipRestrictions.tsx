import { BuildingsIcon, QuestionIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { customersRetrieve, Project } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Panel } from '@waldur/core/Panel';
import {
  getRestrictionsArray,
  MembershipRestrictionFormItems,
  RestrictionField,
} from '@waldur/core/restrictions';
import { Tip } from '@waldur/core/Tooltip';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { usePermission } from '@waldur/permissions/hooks';
import { ActionButton } from '@waldur/table/ActionButton';

import { getInitialValues } from './restrictions/EditProjectMembershipRestrictionsDialog';

interface ProjectMembershipRestrictionsProps {
  project: Project;
}

const EditProjectMembershipRestrictionsDialog = lazyComponent(() =>
  import('./restrictions/EditProjectMembershipRestrictionsDialog').then(
    (module) => ({
      default: module.EditProjectMembershipRestrictionsDialog,
    }),
  ),
);

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
  const dispatch = useDispatch();
  const hasPermission = usePermission();

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
    staleTime: 5 * 60 * 1000,
  });

  const canEdit = hasPermission({
    permission: PermissionEnum.CREATE_PROJECT,
    customerId: project.customer_uuid,
  });

  const restrictionData = useMemo(
    () => ({
      emailPatterns: getRestrictionsArray(project.user_email_patterns),
      affiliations: getRestrictionsArray(project.user_affiliations),
      identitySources: getRestrictionsArray(project.user_identity_sources),
      nationalities: getRestrictionsArray(project['user_nationalities']),
      organizationTypes: getRestrictionsArray(
        project['user_organization_types'],
      ),
      assuranceLevels: getRestrictionsArray(project['user_assurance_levels']),
    }),
    [project],
  );

  const openEditDialog = useCallback(
    (field: RestrictionField) => {
      dispatch(
        openModalDialog(EditProjectMembershipRestrictionsDialog, {
          resolve: { project, field },
          initialValues: getInitialValues(project, field),
        }),
      );
    },
    [dispatch, project],
  );

  const openOrganizationRestrictionsDialog = useCallback(() => {
    if (customer) {
      dispatch(
        openModalDialog(OrganizationRestrictionsDialog, {
          resolve: { customer },
        }),
      );
    }
  }, [dispatch, customer]);

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
          variant="tertiary"
        />
      }
    >
      <FormTable>
        <MembershipRestrictionFormItems
          data={restrictionData}
          canEdit={canEdit}
          onEditField={openEditDialog}
        />
      </FormTable>
    </Panel>
  );
};
