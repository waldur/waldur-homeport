import { useRouter } from '@uirouter/react';
import { useMemo } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useAsync } from 'react-use';

import { ENV } from '@waldur/configs/default';
import {
  PROJECT_ADMIN_ROLE,
  PROJECT_MANAGER_ROLE,
  PROJECT_MEMBER_ROLE,
} from '@waldur/core/constants';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { SymbolsGroup } from '@waldur/customer/dashboard/SymbolsGroup';
import { translate } from '@waldur/i18n';
import { getProject } from '@waldur/workspace/selectors';

import { fetchAllProjectUsers } from './api';

export const ProjectUsersBadge = () => {
  const project = useSelector(getProject);
  const {
    loading,
    error,
    value: users,
  } = useAsync(async () => await fetchAllProjectUsers(project.uuid), [project]);

  const router = useRouter();
  const goToUsers = () => router.stateService.go('project-users');

  const managers = useMemo(
    () =>
      users ? users.filter((user) => user.role === PROJECT_MANAGER_ROLE) : null,
    [users],
  );
  const members = useMemo(
    () =>
      users ? users.filter((user) => user.role === PROJECT_MEMBER_ROLE) : null,
    [users],
  );
  const admins = useMemo(
    () =>
      users ? users.filter((user) => user.role === PROJECT_ADMIN_ROLE) : null,
    [users],
  );

  return (
    <div className="d-flex justify-content-start align-items-xl-center flex-xl-row flex-column gap-xl-6">
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <>{translate('Unable to load users')}</>
      ) : (
        <>
          {managers && managers.length > 0 && (
            <Form.Group as={Row} className="mb-1">
              <Form.Label column xs="auto">
                {translate(ENV.roles.manager)}:
              </Form.Label>
              <Col>
                <SymbolsGroup items={managers} max={6} onClick={goToUsers} />
              </Col>
            </Form.Group>
          )}
          {admins && admins.length > 0 && (
            <Form.Group as={Row} className="mb-1">
              <Form.Label column xs="auto">
                {translate(ENV.roles.admin)}:
              </Form.Label>
              <Col>
                <SymbolsGroup items={admins} max={6} onClick={goToUsers} />
              </Col>
            </Form.Group>
          )}
          {members && members.length > 0 && (
            <Form.Group as={Row} className="mb-1">
              <Form.Label column xs="auto">
                {translate(ENV.roles.member)}:
              </Form.Label>
              <Col>
                <SymbolsGroup items={members} max={6} onClick={goToUsers} />
              </Col>
            </Form.Group>
          )}
        </>
      )}
    </div>
  );
};
