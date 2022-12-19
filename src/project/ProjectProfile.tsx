import { useMemo } from 'react';
import { Card, Col, Form, Row, Stack } from 'react-bootstrap';
import { useAsync } from 'react-use';

import 'world-flags-sprite/stylesheets/flags32.css';

import { ENV } from '@waldur/configs/default';
import {
  PROJECT_ADMIN_ROLE,
  PROJECT_MANAGER_ROLE,
  PROJECT_MEMBER_ROLE,
} from '@waldur/core/constants';
import { formatDate } from '@waldur/core/dateUtils';
import { Image } from '@waldur/core/Image';
import { ImagePlaceholder } from '@waldur/core/ImagePlaceholder';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { SymbolsGroup } from '@waldur/customer/dashboard/SymbolsGroup';
import { translate } from '@waldur/i18n';
import { Project } from '@waldur/workspace/types';

import { fetchAllProjectUsers, loadOecdCodes } from './api';
import { ProjectActions } from './ProjectActions';

export const ProjectProfile = ({ project }: { project: Project }) => {
  const {
    loading,
    error,
    value: users,
  } = useAsync(async () => await fetchAllProjectUsers(project.uuid), [project]);

  const { value: oecdCodes } = useAsync(async () => await loadOecdCodes(), []);

  const oecdCode = useMemo(() => {
    if (!oecdCodes || !project || !project.oecd_fos_2007_code) return null;
    return oecdCodes.find((item) => item.value === project.oecd_fos_2007_code);
  }, [oecdCodes, project]);

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
    <Card className="mb-6">
      <Card.Body>
        <Row>
          <Col xs="auto">
            {project.image ? (
              <Image src={project.image} size={100} />
            ) : (
              <ImagePlaceholder width="100px" height="100px" />
            )}
          </Col>
          <Col className="d-flex flex-column justify-content-between">
            <Row className="mb-6">
              <Col>
                <h2 className="mb-0">{project.name}</h2>
                <Stack direction="horizontal" className="gap-6">
                  {project.oecd_fos_2007_code &&
                    (oecdCode ? (
                      <span>{`${oecdCode.value}. ${oecdCode.label}`}</span>
                    ) : (
                      <span>{project.oecd_fos_2007_code}</span>
                    ))}
                  {project.type && <span>{project.type}</span>}
                  {project.end_date && (
                    <span>
                      {translate('End date:')} {formatDate(project.end_date)}
                    </span>
                  )}
                </Stack>
                <i>{project.customer_name}</i>
                {project.description ? <p>{project.description}</p> : null}
              </Col>
              <Col xs="auto">
                <ProjectActions project={project} />
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
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
                            <SymbolsGroup items={managers} max={6} />
                          </Col>
                        </Form.Group>
                      )}
                      {admins && admins.length > 0 && (
                        <Form.Group as={Row} className="mb-1">
                          <Form.Label column xs="auto">
                            {translate(ENV.roles.admin)}:
                          </Form.Label>
                          <Col>
                            <SymbolsGroup items={admins} max={6} />
                          </Col>
                        </Form.Group>
                      )}
                      {members && members.length > 0 && (
                        <Form.Group as={Row} className="mb-1">
                          <Form.Label column xs="auto">
                            {translate(ENV.roles.member)}:
                          </Form.Label>
                          <Col>
                            <SymbolsGroup items={members} max={6} />
                          </Col>
                        </Form.Group>
                      )}
                    </>
                  )}
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};
