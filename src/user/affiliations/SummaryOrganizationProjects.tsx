import { EyeIcon, PlusIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { NoResult } from '@/navigation/header/search/NoResult';
import { ProjectCreateButton } from '@/project/create/ProjectCreateButton';
import { ProjectsList } from '@/project/ProjectsList';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';

const ProjectDetailsDialog = lazyComponent(() =>
  import('@/project/details/ProjectDetailsDialog').then((module) => ({
    default: module.ProjectDetailsDialog,
  })),
);

const ProjectsListActions = ({ row, fetch }) => {
  const { openDialog } = useModal();
  return (
    <ActionsDropdown
      row={row}
      refetch={fetch}
      actions={[
        ({ row }) => (
          <ActionItem
            title={translate('View details')}
            iconNode={<EyeIcon weight="bold" />}
            action={() =>
              openDialog(ProjectDetailsDialog, {
                project: row,
                size: 'lg',
              })
            }
          />
        ),
      ]}
    />
  );
};

export const SummaryOrganizationProjects = ({ customer }) => {
  return (
    <ProjectsList
      table={`SummaryOrganizationProjects-${customer.uuid}`}
      customer={customer}
      hasActionBar={false}
      hoverShadow={false}
      initialSorting={{ field: 'name', mode: 'asc' }}
      initialPageSize={5}
      minHeight="auto"
      expandableRow={null}
      optionalColumns={['description', 'created']}
      rowActions={ProjectsListActions}
      placeholderComponent={
        <NoResult
          title={translate('No projects found')}
          message={
            <p className="mw-350px">
              {translate(
                'No projects available in the current organization. Start by adding or managing projects to get started.',
              )}
            </p>
          }
          actions={
            <ProjectCreateButton
              customer={customer}
              title={translate('Create project')}
              iconNode={<PlusIcon weight="bold" />}
            />
          }
        />
      }
    />
  );
};
