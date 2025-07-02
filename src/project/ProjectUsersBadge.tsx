import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { FC, PropsWithChildren } from 'react';
import { Col, Row } from 'react-bootstrap';
import { projectsListUsersList } from 'waldur-js-client';

import { getAllPages } from '@waldur/core/api';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getProjectRoles } from '@waldur/permissions/utils';

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

    staleTime: 3 * 60 * 1000,
    enabled: Boolean(props.projectId),
  });

  return isPending ? (
    <LoadingSpinner />
  ) : error ? (
    <LoadingErred
      loadData={refetch}
      message={translate('Unable to load users')}
    />
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
