import { Card, Col, Row, Stack } from 'react-bootstrap';
import Gravatar from 'react-gravatar';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { UserDetails } from '@waldur/workspace/types';

export const UserProfile = ({ user }: { user: UserDetails }) => {
  return (
    <Card className="mb-6">
      <Card.Body>
        <Row>
          <Col xs="auto">
            <Gravatar email={user.email} size={100} className="rounded" />
          </Col>
          <Col>
            <Row className="mb-6">
              <Col>
                <h2>{user.full_name}</h2>
                <Stack direction="horizontal" className="gap-6 text-muted">
                  {user.job_title && (
                    <span>
                      <i className="fa fa-user-circle-o fa-fw me-1" />
                      {user.job_title}
                    </span>
                  )}
                  {user.organization && (
                    <span>
                      <i className="fa fa-map-marker fa-fw me-1" />
                      {user.organization}
                    </span>
                  )}
                  {user.email && (
                    <span>
                      <i className="fa fa-envelope fa-fw me-1" />
                      {user.email}
                    </span>
                  )}
                  {user.phone_number && (
                    <span>
                      <i className="fa fa-phone fa-fw me-1" />
                      {user.phone_number}
                    </span>
                  )}
                </Stack>
              </Col>
              <Col xs="auto">
                <Link
                  className="btn btn-sm btn-secondary text-capitalize"
                  state="profile.manage"
                >
                  {translate('Edit profile')}
                </Link>
              </Col>
            </Row>
            {Array.isArray(user.affiliations) && user.affiliations.length > 0 && (
              <Row className="mb-6">
                <Col>
                  <h6 className="fs-7">{translate('Affiliation')}</h6>
                  {user.affiliations.length < 4 ? (
                    <p className="text-muted mb-0">
                      {user.affiliations.join(', ')}
                    </p>
                  ) : (
                    <p className="text-muted mb-0">
                      {user.affiliations.slice(0, 2).join(', ')}{' '}
                      {translate('and')}{' '}
                      <a>
                        <i>
                          <u>
                            {translate('{count} more affiliations', {
                              count: user.affiliations.length - 2,
                            })}
                          </u>
                        </i>
                      </a>
                    </p>
                  )}
                </Col>
              </Row>
            )}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};
