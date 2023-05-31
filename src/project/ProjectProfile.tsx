import { Card, Col, Row, Stack } from 'react-bootstrap';

import 'world-flags-sprite/stylesheets/flags32.css';

import { formatDate } from '@waldur/core/dateUtils';
import { Image } from '@waldur/core/Image';
import { ImagePlaceholder } from '@waldur/core/ImagePlaceholder';
import { translate } from '@waldur/i18n';
import { Project } from '@waldur/workspace/types';

import { ProjectActions } from './ProjectActions';
import { ProjectUsersBadge } from './ProjectUsersBadge';

export const ProjectProfile = ({ project }: { project: Project }) => (
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
              <i>{project.customer_name}</i>
              {project.description ? <p>{project.description}</p> : null}
            </Col>
            <Col xs="auto">
              <ProjectActions project={project} />
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <ProjectUsersBadge isHorizontal />
            </Col>
          </Row>
        </Col>
      </Row>
    </Card.Body>
  </Card>
);
