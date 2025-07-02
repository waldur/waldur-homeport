import { EyeIcon, PlusIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { NoResult } from '@waldur/navigation/header/search/NoResult';
import { ProjectCreateButton } from '@waldur/project/create/ProjectCreateButton';
import { ProjectsList } from '@waldur/project/ProjectsList';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';

const ProjectDetailsDialog = lazyComponent(() =>
  import('@waldur/project/details/ProjectDetailsDialog').then((module) => ({
    default: module.ProjectDetailsDialog,
  })),
);

const ProjectsListActions = ({ row, fetch }) => {
  const dispatch = useDispatch();
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
              dispatch(
                openModalDialog(ProjectDetailsDialog, {
                  project: row,
                  size: 'lg',
                }),
              )
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
