import { useRouter } from '@uirouter/react';
import { useMemo } from 'react';
import { Card, Col, Row, Stack } from 'react-bootstrap';
import 'world-flags-sprite/stylesheets/flags32.css';
import { useSelector } from 'react-redux';

import { formatDate } from '@waldur/core/dateUtils';
import { Image } from '@waldur/core/Image';
import { ImagePlaceholder } from '@waldur/core/ImagePlaceholder';
import { Link } from '@waldur/core/Link';
import { isFeatureVisible } from '@waldur/features/connect';
import { ProjectFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { getItemAbbreviation } from '@waldur/navigation/workspace/context-selector/utils';
import { isOwnerOrStaff as isOwnerOrStaffSelector } from '@waldur/workspace/selectors';
import { Project } from '@waldur/workspace/types';

import { ProjectActions } from './ProjectActions';
import { ProjectUsersBadge } from './ProjectUsersBadge';

export const ProjectProfile = ({ project }: { project: Project }) => {
  const isOwnerOrStaff = useSelector(isOwnerOrStaffSelector);
  const abbreviation = useMemo(() => getItemAbbreviation(project), [project]);

  const router = useRouter();
  const goToUsers = () => router.stateService.go('project-users');

  return (
    <Card>
      <Card.Body>
        <Row>
          <Col xs="auto">
            {project.image ? (
              <Image src={project.image} size={100} />
            ) : (
              <div className="symbol">
                <ImagePlaceholder
                  width="100px"
                  height="100px"
                  backgroundColor="#e2e2e2"
                >
                  <div className="symbol-label fs-2 fw-bold w-100 h-100">
                    {abbreviation}
                  </div>
                </ImagePlaceholder>
              </div>
            )}
          </Col>
          <Col className="d-flex flex-column justify-content-between">
            <Row className="mb-6">
              <Col>
                <h2 className="mb-0">
                  {project.name}
                  {isFeatureVisible(ProjectFeatures.show_industry_flag) &&
                    project.is_industry && (
                      <span>
                        <i
                          className="fa fa-industry fa-lg"
                          style={{ marginLeft: '5px' }}
                        />
                      </span>
                    )}
                </h2>

                <Stack direction="horizontal" className="gap-6">
                  {project.oecd_fos_2007_code && (
                    <span>{`${project.oecd_fos_2007_code}. ${project.oecd_fos_2007_label}`}</span>
                  )}
                  {project.type && <span>{project.type}</span>}
                  {project.end_date && (
                    <span>
                      {translate('End date:')} {formatDate(project.end_date)}
                    </span>
                  )}
                </Stack>
                {isOwnerOrStaff ? (
                  <Link
                    state="organization.dashboard"
                    params={{ uuid: project.customer_uuid }}
                    label={project.customer_name}
                  />
                ) : (
                  <i>{project.customer_name}</i>
                )}
                {project.description ? <p>{project.description}</p> : null}
              </Col>
              <Col xs="auto">
                <ProjectActions project={project} />
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <ProjectUsersBadge isHorizontal onClick={goToUsers} />
              </Col>
            </Row>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};
