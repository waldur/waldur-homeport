import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { useSelector } from 'react-redux';
import { Project } from 'waldur-js-client';

import { ServiceAccountCreateButton } from '@/customer/service-accounts/ServiceAccountCreateAction';
import { translate } from '@/i18n';
import { InvitationCreateButton } from '@/invitations/actions/create/InvitationCreateButton';
import { AddDropdownToggle } from '@/table/ActionsDropdown';
import { getTableState } from '@/table/selectors';

import { CourseAccountCreateButton } from '../course-accounts/CourseAccountCreateAction';

import { AddUserButton } from './AddUserButton';

interface TeamDropdownActionsProps {
  project: Project;
  refetch?(): void;
}

export const TeamDropdownActions = ({
  project,
  refetch,
}: TeamDropdownActionsProps) => {
  const tableState = useSelector(
    getTableState('marketplace-project-service-accounts'),
  );
  const isServiceAccountLimitReached =
    project.max_service_accounts > 0 &&
    tableState?.pagination?.resultCount >= project.max_service_accounts;

  const isCourseProject = project.kind === 'course';

  // Don't render Add dropdown for removed projects
  if (project.is_removed) {
    return null;
  }

  return (
    <RadixDropdownMenu.Root modal={false}>
      <RadixDropdownMenu.Trigger asChild>
        <AddDropdownToggle size="lg" />
      </RadixDropdownMenu.Trigger>
      <RadixDropdownMenu.Portal>
        <RadixDropdownMenu.Content
          align="start"
          sideOffset={2}
          className="dropdown-menu show position-static"
        >
          {!isCourseProject && (
            <InvitationCreateButton
              project={project}
              roleTypes={['project']}
              refetch={refetch}
              enableBulkUpload={true}
            />
          )}

          {!isCourseProject && (
            <AddUserButton project={project} refetch={refetch} />
          )}
          {project.max_service_accounts !== 0 && (
            <ServiceAccountCreateButton
              context="project"
              scope={project}
              refetch={refetch}
              disabled={isServiceAccountLimitReached}
              tooltip={
                isServiceAccountLimitReached
                  ? translate(
                      'Maximum number of service accounts has been reached',
                    )
                  : undefined
              }
            />
          )}
          <CourseAccountCreateButton project={project} refetch={refetch} />
        </RadixDropdownMenu.Content>
      </RadixDropdownMenu.Portal>
    </RadixDropdownMenu.Root>
  );
};
