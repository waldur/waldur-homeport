import {
  CaretDownIcon,
  PlusCircleIcon,
  SpinnerIcon,
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { Dropdown } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Project } from 'waldur-js-client';

import { count } from '@waldur/core/api';
import { ServiceAccountCreateButton } from '@waldur/customer/service-accounts/ServiceAccountCreateAction';
import { translate } from '@waldur/i18n';
import { InvitationCreateButton } from '@waldur/invitations/actions/create/InvitationCreateButton';
import { getTableState } from '@waldur/table/selectors';
import { useUser } from '@waldur/workspace/hooks';

import { AddUserButton } from './AddUserButton';
import { hasCurrentCustomerPermission } from './utils';

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

  const user = useUser();

  const hasCustomerPermission = useSelector(hasCurrentCustomerPermission);

  const { isLoading, isError, data } = useQuery({
    queryKey: ['TeamDropdownActions', project.uuid],

    queryFn: async () => {
      if (user.is_staff || hasCustomerPermission) {
        return true;
      }
      const usersCount = await count(
        `/api/projects/${project.uuid}/other_users/`,
      );
      return usersCount > 0;
    },
  });

  return (
    <Dropdown placement="bottom-end">
      <Dropdown.Toggle variant="primary" className="no-arrow btn-icon-right">
        <span className="svg-icon svg-icon-2">
          <PlusCircleIcon weight="bold" />
        </span>
        {translate('Add')}
        <span className="svg-icon svg-icon-2 rotate-180">
          <CaretDownIcon weight="bold" />
        </span>
      </Dropdown.Toggle>
      <Dropdown.Menu flip>
        {isLoading ? (
          <Dropdown.Item eventKey="1">
            <SpinnerIcon size={20} className="animation-spin me-2" />
            {translate('Loading actions')}
          </Dropdown.Item>
        ) : isError ? (
          <Dropdown.Item eventKey="1">
            {translate('Unable to load actions')}
          </Dropdown.Item>
        ) : (
          <>
            <InvitationCreateButton
              project={project}
              roleTypes={['project']}
              refetch={refetch}
              enableBulkUpload={true}
            />

            {data && <AddUserButton project={project} refetch={refetch} />}
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
          </>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};
