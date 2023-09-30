import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { fetchAllProjectUsers } from '@waldur/permissions/api';
import { getProjectRoles } from '@waldur/permissions/utils';
import { getProject } from '@waldur/workspace/selectors';

import { UserRoleGroup } from './UserRoleGroup';

interface OwnProps {
  isHorizontal?: boolean;
}

const LayoutWrapper: FC<OwnProps> = (props) =>
  props.isHorizontal ? (
    <div className="d-flex justify-content-start align-items-xl-center flex-xl-row flex-column gap-xl-6">
      {props.children}
    </div>
  ) : (
    <Row>
      <Col xs={12}>{props.children}</Col>
    </Row>
  );

export const ProjectUsersBadge = (props: OwnProps) => {
  const project = useSelector(getProject);
  const {
    loading,
    error,
    value: users,
  } = useAsync(async () => await fetchAllProjectUsers(project.uuid), [project]);

  return loading ? (
    <LoadingSpinner />
  ) : error ? (
    <>{translate('Unable to load users')}</>
  ) : (
    <LayoutWrapper isHorizontal={props.isHorizontal}>
      {getProjectRoles().map((role) => (
        <UserRoleGroup key={role.value} role={role} users={users} />
      ))}
    </LayoutWrapper>
  );
};
