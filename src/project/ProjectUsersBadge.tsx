import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { FC, PropsWithChildren } from 'react';
import { Col, Row } from 'react-bootstrap';
import { projectsListUsersList } from 'waldur-js-client';

import { getAllPages } from '@/core/api';
import { UI_STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { getProjectRoles } from '@/permissions/utils';

import { UserRoleGroup } from './UserRoleGroup';

interface OwnProps {
  isHorizontal?: boolean;
  compact?: boolean;
  max?: number;
  className?: string;
  onClick?(): any;
  projectId?: string;
}

const LayoutWrapper: FC<PropsWithChildren<OwnProps>> = (props) =>
  props.isHorizontal ? (
    <div
      className={classNames(
        'd-flex justify-content-start align-items-xl-center flex-xl-row flex-column gap-xl-6',
        props.className,
      )}
    >
      {props.children}
    </div>
  ) : (
    <Row className={props.className}>
      <Col xs={12}>{props.children}</Col>
    </Row>
  );

export const ProjectUsersBadge = (props: OwnProps) => {
  const {
    data: users,
    isPending,
    error,
    refetch,
  } = useQuery({
    queryKey: ['ProjectTeam', props.projectId],

    queryFn: () =>
      getAllPages((page) =>
        projectsListUsersList({
          path: { uuid: props.projectId },
          query: {
            page,
            field: ['user_uuid', 'user_full_name', 'user_email', 'role_name'],
          },
        }),
      ),

    staleTime: UI_STALE_TIME,
    enabled: Boolean(props.projectId),
    // This badge renders its own error state (and hides on 403), so the
    // global QueryCache onError must not redirect the whole app to the
    // no-permission page when a resource-scoped user gets a 403 here.
    meta: { skipGlobalErrorRedirect: true },
  });

  return isPending ? (
    <LoadingSpinner />
  ) : error ? (
    // A 403 is expected for users whose roles are scoped to the
    // resource or its sub-projects only — they are not allowed to see
    // the parent project team. That is not an error condition; hide
    // the badge instead of rendering an error with a retry button.
    error['response']?.status === 403 ? null : (
      <LoadingErred
        loadData={refetch}
        message={translate('Unable to load users')}
      />
    )
  ) : props.compact ? (
    <UserRoleGroup
      altLabel={translate('Team')}
      users={users}
      max={props.max}
      className={props.className}
      onClick={props.onClick}
    />
  ) : (
    <LayoutWrapper
      isHorizontal={props.isHorizontal}
      className={props.className}
    >
      {getProjectRoles().map((role) => (
        <UserRoleGroup
          key={role.name}
          role={role}
          users={users}
          max={props.max}
          className="align-items-center mb-1"
          onClick={props.onClick}
        />
      ))}
    </LayoutWrapper>
  );
};
